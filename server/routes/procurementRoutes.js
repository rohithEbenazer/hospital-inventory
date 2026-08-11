const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Batch = require('../models/Batch');
const { recordStockTransaction } = require('../services/ledgerService');
const AuditLog = require('../models/AuditLog');

// Get Suppliers
router.get('/suppliers', async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
});

// Create Supplier
router.post('/suppliers', async (req, res, next) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
});

// Get Purchase Orders
router.get('/purchase-orders', async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Create Purchase Order
router.post('/purchase-orders', async (req, res, next) => {
  try {
    const poData = req.body;
    if (!poData.poNumber) {
      poData.poNumber = 'PO-2026-' + Math.floor(1000 + Math.random() * 9000);
    }
    const order = new PurchaseOrder(poData);
    await order.save();

    await AuditLog.create({
      action: 'PO_CREATED',
      module: 'PROCUREMENT',
      performedBy: req.user?.fullName || 'Procurement Officer',
      userRole: req.user?.role || 'PURCHASE_MANAGER',
      details: `Created Purchase Order ${order.poNumber} for ${order.supplierName}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// Receive Goods Receipt Note (GRN) & Create Batch + Stock Ledger
router.post('/purchase-orders/:id/grn', async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

    const grnNo = 'GRN-2026-' + Math.floor(1000 + Math.random() * 9000);
    po.status = 'RECEIVED';
    po.grnNumber = grnNo;
    po.qcStatus = 'PASSED';
    await po.save();

    // Process each item, create batch & update stock ledger
    for (const item of po.items) {
      const batchNo = 'BAT-2026-' + Math.floor(1000 + Math.random() * 9000);
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2); // default 2 years shelf life

      const batch = new Batch({
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        batchNumber: batchNo,
        supplierName: po.supplierName,
        purchaseOrderNo: po.poNumber,
        grnNo,
        quantityReceived: item.orderedQty,
        currentQuantity: item.orderedQty,
        unitCost: item.unitCost,
        mrp: item.unitCost * 1.3,
        expiryDate: expiry,
        qualityStatus: 'APPROVED',
        status: 'AVAILABLE'
      });
      await batch.save();

      // Record stock ledger addition
      await recordStockTransaction({
        productId: item.productId,
        warehouseName: 'Central Store',
        batchNumber: batchNo,
        transactionType: 'PURCHASE_RECEIPT',
        referenceType: 'GRN',
        referenceId: grnNo,
        quantity: item.orderedQty,
        unitCost: item.unitCost,
        reason: `GRN received for PO ${po.poNumber}`,
        performedBy: req.user?.fullName || 'Store Keeper'
      });
    }

    await AuditLog.create({
      action: 'GRN_RECEIVED',
      module: 'PROCUREMENT',
      performedBy: req.user?.fullName || 'Store Keeper',
      userRole: req.user?.role || 'STORE_KEEPER',
      details: `Generated GRN ${grnNo} for PO ${po.poNumber}`
    });

    res.json({ success: true, message: 'GRN processed and stock updated', grnNumber: grnNo, data: po });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
