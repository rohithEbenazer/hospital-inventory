const express = require('express');
const router = express.Router();
const InventoryBalance = require('../models/InventoryBalance');
const Batch = require('../models/Batch');
const TransactionLedger = require('../models/TransactionLedger');
const { allocateStockFEFO } = require('../services/fefoEngine');
const { recordStockTransaction } = require('../services/ledgerService');

// Get overall stock balances
router.get('/balances', async (req, res, next) => {
  try {
    const balances = await InventoryBalance.find().populate('productId');
    res.json({ success: true, data: balances });
  } catch (err) {
    next(err);
  }
});

// Get active batches with FEFO status
router.get('/batches', async (req, res, next) => {
  try {
    const { status, nearExpiry } = req.query;
    const query = {};

    if (status) query.status = status;
    if (nearExpiry === 'true') {
      const future30 = new Date();
      future30.setDate(future30.getDate() + 90); // Near expiry within 90 days
      query.expiryDate = { $lte: future30, $gt: new Date() };
    }

    const batches = await Batch.find(query).sort({ expiryDate: 1 });
    res.json({ success: true, data: batches });
  } catch (err) {
    next(err);
  }
});

// Get immutable stock transaction ledger
router.get('/ledger', async (req, res, next) => {
  try {
    const ledger = await TransactionLedger.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: ledger });
  } catch (err) {
    next(err);
  }
});

// FEFO allocation preview endpoint
router.get('/fefo-allocation/:productId', async (req, res, next) => {
  try {
    const qty = parseInt(req.query.quantity) || 1;
    const allocationResult = await allocateStockFEFO(req.params.productId, qty);
    res.json({ success: true, data: allocationResult });
  } catch (err) {
    next(err);
  }
});

// Stock adjustment / Write-off endpoint
router.post('/adjust', async (req, res, next) => {
  try {
    const { productId, warehouseName, batchNumber, adjustmentQty, type, reason } = req.body;
    
    const result = await recordStockTransaction({
      productId,
      warehouseName: warehouseName || 'Central Store',
      batchNumber,
      transactionType: type || 'ADJUSTMENT_IN',
      quantity: Number(adjustmentQty),
      reason,
      performedBy: req.user?.fullName || 'Store Manager'
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
