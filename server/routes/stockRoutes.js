const express = require('express');
const router = express.Router();
const InventoryBalance = require('../models/InventoryBalance');
const Batch = require('../models/Batch');
const TransactionLedger = require('../models/TransactionLedger');
const { allocateStockFEFO } = require('../services/fefoEngine');
const { recordStockTransaction } = require('../services/ledgerService');
const { authenticateToken } = require('../middleware/auth');
const { requireIdempotency } = require('../middleware/idempotencyMiddleware');

// Protect all stock routes with authentication middleware
router.use(authenticateToken);

// Get overall stock balances (scoped by tenant hospitalId)
router.get('/balances', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const balances = await InventoryBalance.find({ hospitalId }).populate('productId');
    res.json({ success: true, data: balances });
  } catch (err) {
    next(err);
  }
});

// Get active batches with FEFO status (scoped by tenant hospitalId)
router.get('/batches', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { status, nearExpiry } = req.query;
    const query = { hospitalId };

    if (status) {
      query.status = status;
    } else {
      // Exclude expired, quarantined, or recalled batches by default
      query.status = { $nin: ['EXPIRED', 'RECALLED', 'QUARANTINED', 'BLOCKED'] };
    }

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

// Get immutable stock transaction ledger (scoped by tenant hospitalId)
router.get('/ledger', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const ledger = await TransactionLedger.find({ hospitalId }).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: ledger });
  } catch (err) {
    next(err);
  }
});

// FEFO allocation preview endpoint (scoped by tenant hospitalId)
router.get('/fefo-allocation/:productId', async (req, res, next) => {
  try {
    const qty = parseInt(req.query.quantity) || 1;
    const allocationResult = await allocateStockFEFO(req.params.productId, qty, req.user.hospitalId);
    res.json({ success: true, data: allocationResult });
  } catch (err) {
    next(err);
  }
});

// Stock adjustment endpoint with idempotency guard
router.post('/adjust', requireIdempotency, async (req, res, next) => {
  try {
    const { productId, warehouseName, batchNumber, adjustmentQty, type, reason } = req.body;
    
    // Server enforces authorized transaction type (cannot pass arbitrary system strings)
    const allowedType = type === 'WRITE_OFF' || type === 'DAMAGE' || type === 'EXPIRY' ? type : 'ADJUSTMENT_IN';

    const result = await recordStockTransaction({
      hospitalId: req.user.hospitalId,
      productId,
      warehouseName: warehouseName || 'Central Store',
      batchNumber,
      transactionType: allowedType,
      quantity: Number(adjustmentQty),
      reason,
      performedBy: req.user.fullName || 'Store Manager'
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
