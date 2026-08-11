const express = require('express');
const router = express.Router();
const StockTransfer = require('../models/StockTransfer');
const Batch = require('../models/Batch');
const { recordStockTransaction } = require('../services/ledgerService');
const { authenticateToken } = require('../middleware/auth');

// Get all inter-store transfers
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const transfers = await StockTransfer.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: transfers });
  } catch (err) {
    next(err);
  }
});

// Create transfer request
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const transferData = req.body;
    transferData.hospitalId = hospitalId;
    transferData.transferNumber = 'TRF-2026-' + Math.floor(1000 + Math.random() * 9000);
    transferData.requestedBy = req.user.fullName || 'Store Keeper';

    const transfer = new StockTransfer(transferData);
    await transfer.save();

    res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
});

// Dispatch / Mark IN_TRANSIT
router.post('/:id/dispatch', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const transfer = await StockTransfer.findOne({ _id: req.params.id, hospitalId });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer request not found' });

    // Deduct stock from source warehouse
    for (const item of transfer.items) {
      await recordStockTransaction({
        hospitalId,
        productId: item.productId,
        warehouseName: transfer.fromWarehouse,
        batchNumber: item.batchNumber,
        transactionType: 'TRANSFER_OUT',
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        quantity: -item.transferQty,
        reason: `Inter-store transfer dispatch to ${transfer.toWarehouse}`,
        performedBy: req.user.fullName
      });
    }

    transfer.status = 'IN_TRANSIT';
    transfer.dispatchedBy = req.user.fullName;
    await transfer.save();

    res.json({ success: true, message: 'Transfer dispatched and placed IN_TRANSIT', data: transfer });
  } catch (err) {
    next(err);
  }
});

// Receive at destination warehouse
router.post('/:id/receive', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const transfer = await StockTransfer.findOne({ _id: req.params.id, hospitalId });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer request not found' });

    if (transfer.status !== 'IN_TRANSIT') {
      return res.status(400).json({ success: false, message: 'Transfer is not in IN_TRANSIT status' });
    }

    // Add stock to destination warehouse
    for (const item of transfer.items) {
      await recordStockTransaction({
        hospitalId,
        productId: item.productId,
        warehouseName: transfer.toWarehouse,
        batchNumber: item.batchNumber,
        transactionType: 'TRANSFER_IN',
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        quantity: item.transferQty,
        reason: `Inter-store transfer receipt from ${transfer.fromWarehouse}`,
        performedBy: req.user.fullName
      });
    }

    transfer.status = 'RECEIVED';
    transfer.receivedBy = req.user.fullName;
    await transfer.save();

    res.json({ success: true, message: 'Transfer received and added to store inventory', data: transfer });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
