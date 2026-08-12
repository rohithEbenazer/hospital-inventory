const express = require('express');
const router = express.Router();
const StockAdjustment = require('../models/StockAdjustment');
const InventoryBalance = require('../models/InventoryBalance');
const TransactionLedger = require('../models/TransactionLedger');
const mongoose = require('mongoose');
const { authenticate, requireRole } = require('../middleware/auth');
const auditService = require('../services/auditService');

// GET all adjustments
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25, status } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      StockAdjustment.find(filter)
        .populate('productId', 'name sku')
        .populate('warehouseId', 'name')
        .populate('requestedBy', 'name')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      StockAdjustment.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single
router.get('/:id', authenticate, async (req, res) => {
  try {
    const adj = await StockAdjustment.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId })
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');
    if (!adj) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    res.json({ success: true, data: adj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create adjustment (draft)
router.post('/', authenticate, async (req, res) => {
  try {
    const adj = await StockAdjustment.create({
      ...req.body,
      hospitalId: req.user.hospitalId,
      requestedBy: req.user.id,
      status: 'PENDING_APPROVAL',
    });
    res.status(201).json({ success: true, message: 'Adjustment created, pending approval', data: adj });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST approve adjustment (atomically post to inventory)
router.post('/:id/approve', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const adj = await StockAdjustment.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId }).session(session);
      if (!adj) throw new Error('Adjustment not found');
      if (adj.status !== 'PENDING_APPROVAL') throw new Error(`Cannot approve adjustment in status: ${adj.status}`);

      const bal = await InventoryBalance.findOne({
        hospitalId: req.user.hospitalId, productId: adj.productId, warehouseId: adj.warehouseId
      }).session(session);

      const currentQty = bal?.availableQty || 0;
      const delta = adj.actualQty - currentQty;

      // Post inventory balance change
      if (bal) {
        await InventoryBalance.findByIdAndUpdate(bal._id, { $inc: { availableQty: delta } }, { session });
      } else {
        await InventoryBalance.create([{ hospitalId: req.user.hospitalId, productId: adj.productId, warehouseId: adj.warehouseId, availableQty: adj.actualQty }], { session });
      }

      // Write immutable ledger entry
      await TransactionLedger.create([{
        hospitalId: req.user.hospitalId,
        transactionType: 'ADJUSTMENT',
        productId: adj.productId,
        warehouseId: adj.warehouseId,
        quantity: delta,
        referenceType: 'StockAdjustment',
        referenceId: adj._id,
        performedBy: req.user.id,
        reason: adj.reason,
        notes: adj.notes,
      }], { session });

      adj.status = 'POSTED';
      adj.approvedBy = req.user.id;
      adj.approvedAt = new Date();
      adj.postedAt = new Date();
      adj.currentQty = currentQty;
      adj.variance = delta;
      await adj.save({ session });

      result = adj;
    });

    await auditService.log({
      userId: req.user.id, role: req.user.role, hospitalId: req.user.hospitalId,
      action: auditService.ACTIONS.STOCK_ADJUSTED,
      resource: 'StockAdjustment', resourceId: req.params.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Adjustment approved and posted to inventory', data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message, code: 'ADJUSTMENT_FAILED' });
  } finally {
    session.endSession();
  }
});

// POST reject
router.post('/:id/reject', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const adj = await StockAdjustment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId, status: 'PENDING_APPROVAL' },
      { $set: { status: 'REJECTED', approvedBy: req.user.id, approvedAt: new Date() } },
      { new: true }
    );
    if (!adj) return res.status(404).json({ success: false, message: 'Adjustment not found or not pending' });
    res.json({ success: true, message: 'Adjustment rejected', data: adj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
