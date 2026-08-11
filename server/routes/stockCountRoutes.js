const express = require('express');
const router = express.Router();
const StockCount = require('../models/StockCount');
const { recordStockTransaction } = require('../services/ledgerService');
const { authenticateToken } = require('../middleware/auth');

// Get all physical count sessions
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const counts = await StockCount.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
});

// Create new physical stock count session
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const countData = req.body;
    countData.hospitalId = hospitalId;
    countData.countNumber = 'SC-2026-' + Math.floor(1000 + Math.random() * 9000);
    countData.conductedBy = req.user.fullName || 'Auditor';

    const stockCount = new StockCount(countData);
    await stockCount.save();

    res.status(201).json({ success: true, data: stockCount });
  } catch (err) {
    next(err);
  }
});

// Approve & post inventory variance adjustments
router.post('/:id/post-variance', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const sc = await StockCount.findOne({ _id: req.params.id, hospitalId });
    if (!sc) return res.status(404).json({ success: false, message: 'Stock Count session not found' });

    sc.approvedBy = req.user.fullName || 'Inventory Admin';

    // Post variance adjustments to ledger
    for (const item of sc.items) {
      if (item.varianceQty !== 0) {
        const txType = item.varianceQty > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
        await recordStockTransaction({
          hospitalId,
          productId: item.productId,
          warehouseName: sc.warehouseName,
          batchNumber: item.batchNumber,
          transactionType: txType,
          referenceType: 'STOCK_COUNT',
          referenceId: sc.countNumber,
          quantity: item.varianceQty,
          reason: `Physical stock count variance adjustment (${item.reason || 'Audit variance'})`,
          performedBy: req.user.fullName
        });
      }
    }

    sc.status = 'APPROVED_AND_POSTED';
    await sc.save();

    res.json({ success: true, message: 'Physical count variance posted to stock ledger successfully', data: sc });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
