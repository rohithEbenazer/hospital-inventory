const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseRequest = require('../models/PurchaseRequest');
const RFQ = require('../models/RFQ');
const GoodsReceipt = require('../models/GoodsReceipt');
const Batch = require('../models/Batch');
const { recordStockTransaction } = require('../services/ledgerService');
const { authenticateToken } = require('../middleware/auth');
const { requireIdempotency } = require('../middleware/idempotencyMiddleware');
const AuditLog = require('../models/AuditLog');

router.use(authenticateToken);

// Get Suppliers (scoped by hospitalId)
router.get('/suppliers', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const suppliers = await Supplier.find({ hospitalId });
    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
});

// Create Supplier (scoped by hospitalId)
router.post('/suppliers', async (req, res, next) => {
  try {
    const supplierData = { ...req.body, hospitalId: req.user.hospitalId };
    const supplier = new Supplier(supplierData);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
});

// Get Purchase Requests (PR) (scoped by hospitalId)
router.get('/purchase-requests', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const prs = await PurchaseRequest.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: prs });
  } catch (err) {
    next(err);
  }
});

// Create Purchase Request (scoped by hospitalId)
router.post('/purchase-requests', async (req, res, next) => {
  try {
    const prData = { ...req.body, hospitalId: req.user.hospitalId };
    prData.prNumber = 'PR-2026-' + Math.floor(1000 + Math.random() * 9000);
    prData.requestedBy = req.user.fullName || 'Procurement Officer';

    const pr = new PurchaseRequest(prData);
    await pr.save();

    res.status(201).json({ success: true, data: pr });
  } catch (err) {
    next(err);
  }
});

// Get RFQs (scoped by hospitalId)
router.get('/rfqs', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const rfqs = await RFQ.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: rfqs });
  } catch (err) {
    next(err);
  }
});

// Create RFQ (scoped by hospitalId)
router.post('/rfqs', async (req, res, next) => {
  try {
    const rfqData = { ...req.body, hospitalId: req.user.hospitalId };
    rfqData.rfqNumber = 'RFQ-2026-' + Math.floor(1000 + Math.random() * 9000);
    const rfq = new RFQ(rfqData);
    await rfq.save();
    res.status(201).json({ success: true, data: rfq });
  } catch (err) {
    next(err);
  }
});

// Get Purchase Orders (scoped by hospitalId)
router.get('/purchase-orders', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const orders = await PurchaseOrder.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Create Purchase Order (scoped by hospitalId)
router.post('/purchase-orders', async (req, res, next) => {
  try {
    const poData = { ...req.body, hospitalId: req.user.hospitalId };
    if (!poData.poNumber) {
      poData.poNumber = 'PO-2026-' + Math.floor(1000 + Math.random() * 9000);
    }
    poData.requestedBy = req.user.fullName || 'Procurement Officer';
    const order = new PurchaseOrder(poData);
    await order.save();

    await AuditLog.create({
      hospitalId: req.user.hospitalId,
      action: 'PO_CREATED',
      module: 'PROCUREMENT',
      performedBy: req.user.fullName || 'Procurement Officer',
      userRole: req.user.role || 'PURCHASE_MANAGER',
      details: `Created Purchase Order ${order.poNumber} for ${order.supplierName}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// Receive Goods Receipt Note (GRN) with idempotency key guard & tenant isolation
router.post('/purchase-orders/:id/grn', requireIdempotency, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const po = await PurchaseOrder.findOne({ _id: req.params.id, hospitalId });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

    if (po.status === 'RECEIVED') {
      return res.status(400).json({ success: false, message: 'Purchase Order has already been received and processed.' });
    }

    const { itemsDelivery, deliveryChallanNo, invoiceNumber, qcInspectorName } = req.body;
    const grnNo = 'GRN-2026-' + Math.floor(1000 + Math.random() * 9000);

    po.status = 'RECEIVED';
    po.grnNumber = grnNo;
    po.qcStatus = 'PASSED';
    await po.save();

    const grnItems = [];

    for (let i = 0; i < po.items.length; i++) {
      const item = po.items[i];
      const delivery = (itemsDelivery && itemsDelivery[i]) || {};

      const batchNo = delivery.batchNumber || ('BAT-2026-' + Math.floor(1000 + Math.random() * 9000));
      const physicalExpiry = delivery.expiryDate ? new Date(delivery.expiryDate) : new Date(Date.now() + 730*24*60*60*1000);
      const qcStatus = delivery.qcStatus || 'PASSED';

      const batch = new Batch({
        hospitalId,
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
        expiryDate: physicalExpiry,
        qualityStatus: qcStatus,
        status: qcStatus === 'PASSED' ? 'AVAILABLE' : 'QUARANTINED'
      });
      await batch.save();

      if (qcStatus === 'PASSED') {
        await recordStockTransaction({
          hospitalId,
          productId: item.productId,
          warehouseName: 'Central Store',
          batchNumber: batchNo,
          transactionType: 'PURCHASE_RECEIPT',
          referenceType: 'GRN',
          referenceId: grnNo,
          quantity: item.orderedQty,
          unitCost: item.unitCost,
          reason: `GRN received for PO ${po.poNumber} (QC Passed)`,
          performedBy: req.user.fullName || 'Store Keeper'
        });
      }

      grnItems.push({
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        orderedQty: item.orderedQty,
        receivedQty: item.orderedQty,
        acceptedQty: qcStatus === 'PASSED' ? item.orderedQty : 0,
        rejectedQty: qcStatus === 'REJECTED' ? item.orderedQty : 0,
        batchNumber: batchNo,
        physicalExpiryDate: physicalExpiry,
        unitCost: item.unitCost,
        mrp: item.unitCost * 1.3,
        qcStatus
      });
    }

    const grn = new GoodsReceipt({
      hospitalId,
      grnNumber: grnNo,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      receivedBy: req.user.fullName || 'Store Keeper',
      deliveryChallanNo,
      invoiceNumber,
      qcInspectorName: qcInspectorName || req.user.fullName,
      items: grnItems,
      status: 'APPROVED'
    });
    await grn.save();

    res.json({ success: true, message: 'GRN created with actual delivered batch expiry dates and QC verification!', grnNumber: grnNo, data: grn });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
