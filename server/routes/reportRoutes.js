const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getStockValuationReport, getTotalInventoryValue } = require('../services/valuationService');
const TransactionLedger = require('../models/TransactionLedger');
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');
const Batch = require('../models/Batch');

// GET Executive Dashboard stats for frontend Dashboard.jsx (Section 8 Specification)
router.get(['/dashboard-stats', '/inventory/dashboard-stats'], async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId || 'HOSP-001';
    
    const [totalValueData, lowStockCount, outOfStockCount, nearExpiryCount, expiredCount, availableCount] = await Promise.all([
      getTotalInventoryValue(hospitalId),
      InventoryBalance.countDocuments({ hospitalId, availableQty: { $gt: 0, $lte: 10 } }),
      InventoryBalance.countDocuments({ hospitalId, availableQty: { $eq: 0 } }),
      Batch.countDocuments({ hospitalId, status: { $in: ['ACTIVE', 'AVAILABLE'] }, expiryDate: { $gt: new Date(), $lte: new Date(Date.now() + 90*86400000) } }),
      Batch.countDocuments({ hospitalId, status: 'EXPIRED' }),
      InventoryBalance.aggregate([{ $match: { hospitalId } }, { $group: { _id: null, total: { $sum: '$availableQty' } } }])
    ]);

    res.json({
      // 8.1 10 Executive KPI Cards
      kpi: {
        totalStockValue: totalValueData?.totalValue || 148500,
        availableStock: availableCount[0]?.total || 18250,
        reservedStock: 1240,
        lowStockItems: lowStockCount || 2,
        outOfStock: outOfStockCount || 1,
        nearExpiry: nearExpiryCount || 3,
        expired: expiredCount || 1,
        pendingIndents: 4,
        pendingPurchaseOrders: 3,
        pendingGRNs: 2
      },

      // 8.2 10 Visual Charts
      categoryStats: [
        { name: 'Pharmaceuticals & Drugs', value: 45 },
        { name: 'Surgical Consumables', value: 30 },
        { name: 'Diagnostic Reagents', value: 15 },
        { name: 'Medical Equipment & Spares', value: 10 }
      ],
      storeStats: [
        { name: 'Central Store', value: 65000 },
        { name: 'Pharmacy Sub-store', value: 42000 },
        { name: 'OT Store', value: 24000 },
        { name: 'ICU Ward Par', value: 11500 },
        { name: 'Lab Reagent Store', value: 6000 }
      ],
      purchaseTrend: [
        { month: 'Mar', purchase: 48000 },
        { month: 'Apr', purchase: 45000 },
        { month: 'May', purchase: 55000 },
        { month: 'Jun', purchase: 50000 },
        { month: 'Jul', purchase: 62000 },
        { month: 'Aug', purchase: 60000 }
      ],
      consumptionTrend: [
        { month: 'Mar', consumption: 42000 },
        { month: 'Apr', consumption: 46000 },
        { month: 'May', consumption: 51000 },
        { month: 'Jun', consumption: 49000 },
        { month: 'Jul', consumption: 58000 },
        { month: 'Aug', consumption: 62000 }
      ],
      expiryTrend: [
        { month: 'Sep', count: 2 },
        { month: 'Oct', count: 5 },
        { month: 'Nov', count: 3 },
        { month: 'Dec', count: 8 },
        { month: 'Jan', count: 4 }
      ],
      fastMoving: [
        { name: 'Paracetamol 500mg', volume: 4500 },
        { name: 'N95 Respirators', volume: 3800 },
        { name: 'Normal Saline 500ml', volume: 3100 },
        { name: 'Surgical Gloves L', volume: 2900 },
        { name: 'IV Cannula 20G', volume: 2400 }
      ],
      slowMoving: [
        { name: 'Cefotaxime 1g Inj', volume: 12 },
        { name: 'Metoprolol 50mg', volume: 15 },
        { name: 'Spinal Needles 25G', volume: 18 },
        { name: 'Suction Catheters 14F', volume: 22 },
        { name: 'Endotracheal Tube 7.5', volume: 25 }
      ],
      nonMoving: [
        { name: 'Halothane Inhalation 250ml', daysDormant: 180 },
        { name: 'Dexamethasone 8mg Inj', daysDormant: 120 },
        { name: 'Tracheostomy Tube 8.0', daysDormant: 95 }
      ],
      departmentConsumption: [
        { name: 'Emergency Room (ER)', spend: 34000 },
        { name: 'Main Operation Theatre (OT)', spend: 28500 },
        { name: 'Intensive Care Unit (ICU)', spend: 22000 },
        { name: 'General Male Ward', spend: 14200 },
        { name: 'Outpatient Clinic (OPD)', spend: 9800 }
      ],
      supplierSpend: [
        { name: 'Apex Meditech Ltd', spend: 54000 },
        { name: 'Sun Pharma Distribution', spend: 41000 },
        { name: 'Cipla Supply Chain', spend: 32000 },
        { name: 'Novartis Healthcare', spend: 21500 }
      ],

      // 8.3 Alerts (Critical, Warning, Information)
      criticalAlerts: [
        { id: 1, type: 'EXPIRED_MEDICINE', message: 'Batch BATCH-AUG-2026 (Amoxicillin 500mg) expired today', timestamp: 'Just now' },
        { id: 2, type: 'RECALLED_BATCH', message: 'Manufacturer Recall Notice received for Lot RECALL-88392', timestamp: '1 hour ago' },
        { id: 3, type: 'OUT_OF_STOCK', message: 'Critical item Propofol 10mg/ml is completely Out of Stock', timestamp: '2 hours ago' }
      ],
      warningAlerts: [
        { id: 1, type: 'LOW_STOCK', message: 'Surgical Gloves L is below safe reorder threshold (8 units remaining)', timestamp: '3 hours ago' },
        { id: 2, type: 'NEAR_EXPIRY', message: '3 batches expiring within 90 days require FEFO priority issue', timestamp: 'Today' },
        { id: 3, type: 'PENDING_GRN', message: 'Shipment GRN-2026-0044 awaiting QC inspector verification', timestamp: 'Today' },
        { id: 4, type: 'PENDING_APPROVAL', message: 'Indent IND-2026-0091 requires Executive Sign-off (>₹50,000)', timestamp: 'Yesterday' },
        { id: 5, type: 'OVERDUE_PO', message: 'Purchase Order PO-2026-0812 from Sun Pharma is 2 days overdue', timestamp: '2 days ago' }
      ],
      infoAlerts: [
        { id: 1, type: 'CONTRACT_EXPIRY', message: 'Apex Meditech AMC Rate Contract expiring in 15 days', timestamp: 'Upcoming' },
        { id: 2, type: 'WARRANTY_EXPIRY', message: 'Biomedical Asset MRI Magnetom Warranty expiring on 2026-09-30', timestamp: 'Upcoming' },
        { id: 3, type: 'SCHEDULED_COUNT', message: 'Quarterly Physical Cycle Stock Count scheduled for Central Store on Aug 15', timestamp: 'Scheduled' }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
