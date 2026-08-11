const express = require('express');
const router = express.Router();
const RecallNotice = require('../models/RecallNotice');
const Batch = require('../models/Batch');
const { authenticateToken } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// Get batch recall notices
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const recalls = await RecallNotice.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: recalls });
  } catch (err) {
    next(err);
  }
});

// Issue Batch Recall Notice & Quarantine Stock Immediately
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId || 'HOSP-001';
    const { productId, productName, batchNumber, reason } = req.body;

    const recallNo = 'RCL-2026-' + Math.floor(1000 + Math.random() * 9000);

    // Lock all matching batches across stores immediately!
    const updatedBatches = await Batch.updateMany(
      { hospitalId, batchNumber },
      {
        $set: {
          recallStatus: 'RECALLED',
          qualityStatus: 'QUARANTINED',
          status: 'RECALLED'
        }
      }
    );

    const recall = new RecallNotice({
      hospitalId,
      recallNumber: recallNo,
      productId,
      productName,
      batchNumber,
      reason,
      issuedBy: req.user.fullName || 'Safety Officer',
      quarantinedQty: updatedBatches.modifiedCount || 0
    });

    await recall.save();

    await AuditLog.create({
      action: 'BATCH_RECALLED',
      module: 'RECALL',
      performedBy: req.user.fullName || 'Safety Officer',
      userRole: req.user.role || 'INVENTORY_ADMIN',
      details: `Issued Recall ${recallNo} for Batch ${batchNumber} (${productName}). Stock quarantined immediately.`
    });

    res.status(201).json({
      success: true,
      message: `Recall ${recallNo} issued! Quarantined matching batches. FEFO engine will automatically bypass this batch.`,
      data: recall
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
