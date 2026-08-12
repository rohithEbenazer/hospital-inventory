const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getStockValuationReport, getTotalInventoryValue } = require('../services/valuationService');
const TransactionLedger = require('../models/TransactionLedger');
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');
const Batch = require('../models/Batch');

// ─── INVENTORY ────────────────────────────────────────────────────────────────

// GET inventory summary
router.get('/inventory/summary', authenticate, async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const [balances, lowStockCount, totalValue] = await Promise.all([
      InventoryBalance.aggregate([
        { $match: { hospitalId } },
        { $group: { _id: null, totalItems: { $sum: 1 }, totalQty: { $sum: '$availableQty' } } }
      ]),
      InventoryBalance.aggregate([
        { $match: { hospitalId } },
        { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $match: { $expr: { $lte: ['$availableQty', '$product.reorderPoint'] } } },
        { $count: 'count' }
      ]),
      getTotalInventoryValue(hospitalId),
    ]);
    res.json({ success: true, data: { ...balances[0], lowStockCount: lowStockCount[0]?.count || 0, totalValue: totalValue.totalValue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET inventory valuation
router.get('/inventory/valuation', authenticate, async (req, res) => {
  try {
    const data = await getStockValuationReport(req.user.hospitalId);
    const summary = await getTotalInventoryValue(req.user.hospitalId);
    res.json({ success: true, data, meta: { totalValue: summary.totalValue, totalQty: summary.totalQty } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stock ledger
router.get('/inventory/ledger', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, productId, warehouseId, startDate, endDate, transactionType } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (productId) filter.productId = productId;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (transactionType) filter.transactionType = transactionType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      TransactionLedger.find(filter)
        .populate('productId', 'name sku')
        .populate('warehouseId', 'name')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      TransactionLedger.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stock movement
router.get('/inventory/movement', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { hospitalId: req.user.hospitalId };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const data = await TransactionLedger.aggregate([
      { $match: match },
      {
        $group: {
          _id: { productId: '$productId', type: '$transactionType' },
          totalQty: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'products', localField: '_id.productId', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { productName: '$product.name', sku: '$product.sku', type: '$_id.type', totalQty: 1, count: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET expiry report
router.get('/inventory/expiry', authenticate, async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() + 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    const d60 = new Date(now); d60.setDate(d60.getDate() + 60);
    const d90 = new Date(now); d90.setDate(d90.getDate() + 90);

    const [expired, exp7, exp30, exp60, exp90] = await Promise.all([
      Batch.find({ hospitalId, expiryDate: { $lt: now }, status: { $in: ['ACTIVE','AVAILABLE'] } }).populate('productId', 'name sku'),
      Batch.find({ hospitalId, expiryDate: { $gte: now, $lte: d7 }, status: { $in: ['ACTIVE','AVAILABLE'] } }).populate('productId', 'name sku'),
      Batch.find({ hospitalId, expiryDate: { $gt: d7, $lte: d30 }, status: { $in: ['ACTIVE','AVAILABLE'] } }).populate('productId', 'name sku'),
      Batch.find({ hospitalId, expiryDate: { $gt: d30, $lte: d60 }, status: { $in: ['ACTIVE','AVAILABLE'] } }).populate('productId', 'name sku'),
      Batch.find({ hospitalId, expiryDate: { $gt: d60, $lte: d90 }, status: { $in: ['ACTIVE','AVAILABLE'] } }).populate('productId', 'name sku'),
    ]);
    res.json({ success: true, data: { expired, expiring7Days: exp7, expiring30Days: exp30, expiring60Days: exp60, expiring90Days: exp90 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET consumption report
router.get('/inventory/consumption', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    const match = { hospitalId: req.user.hospitalId, transactionType: { $in: ['ISSUE', 'DISPENSE'] } };
    if (startDate || endDate) { match.createdAt = {}; if (startDate) match.createdAt.$gte = new Date(startDate); if (endDate) match.createdAt.$lte = new Date(endDate); }

    const data = await TransactionLedger.aggregate([
      { $match: match },
      { $group: { _id: '$productId', totalConsumed: { $sum: { $abs: '$quantity' } }, transactions: { $sum: 1 } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { productName: '$product.name', sku: '$product.sku', totalConsumed: 1, transactions: 1 } },
      { $sort: { totalConsumed: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET fast/slow/non-moving items
router.get('/inventory/fast-moving', authenticate, async (req, res) => {
  try {
    const data = await TransactionLedger.aggregate([
      { $match: { hospitalId: req.user.hospitalId, transactionType: { $in: ['ISSUE', 'DISPENSE'] } } },
      { $group: { _id: '$productId', totalQty: { $sum: { $abs: '$quantity' } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { productName: '$product.name', sku: '$product.sku', totalQty: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/inventory/slow-moving', authenticate, async (req, res) => {
  try {
    const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const data = await TransactionLedger.aggregate([
      { $match: { hospitalId: req.user.hospitalId, transactionType: { $in: ['ISSUE', 'DISPENSE'] }, createdAt: { $gte: sixtyDaysAgo } } },
      { $group: { _id: '$productId', totalQty: { $sum: { $abs: '$quantity' } } } },
      { $match: { totalQty: { $lt: 5 } } },
      { $sort: { totalQty: 1 } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { productName: '$product.name', sku: '$product.sku', totalQty: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET procurement report
router.get('/procurement/purchases', authenticate, async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrder');
    const { startDate, endDate } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (startDate || endDate) { filter.createdAt = {}; if (startDate) filter.createdAt.$gte = new Date(startDate); if (endDate) filter.createdAt.$lte = new Date(endDate); }

    const [orders, summary] = await Promise.all([
      PurchaseOrder.find(filter).populate('supplierId', 'name').sort({ createdAt: -1 }).limit(100),
      PurchaseOrder.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } }
      ])
    ]);
    res.json({ success: true, data: orders, meta: { summary } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET supplier performance
router.get('/procurement/suppliers', authenticate, async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrder');
    const data = await PurchaseOrder.aggregate([
      { $match: { hospitalId: req.user.hospitalId } },
      { $group: { _id: '$supplierId', totalOrders: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      { $project: { supplierName: '$supplier.name', totalOrders: 1, totalValue: 1 } },
      { $sort: { totalValue: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET department consumption
router.get('/inventory/department', authenticate, async (req, res) => {
  try {
    const PatientConsumption = require('../models/PatientConsumption');
    const { startDate, endDate } = req.query;
    const match = { hospitalId: req.user.hospitalId };
    if (startDate || endDate) { match.consumedAt = {}; if (startDate) match.consumedAt.$gte = new Date(startDate); if (endDate) match.consumedAt.$lte = new Date(endDate); }

    const data = await PatientConsumption.aggregate([
      { $match: match },
      { $group: { _id: '$departmentId', totalQty: { $sum: '$quantity' }, totalCost: { $sum: '$totalCost' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { deptName: '$dept.name', totalQty: 1, totalCost: 1 } },
      { $sort: { totalCost: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
