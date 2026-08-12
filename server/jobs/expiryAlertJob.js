/**
 * expiryAlertJob — runs on startup and every hour
 * Checks batches expiring in 90/60/30/14/7/1 days, creates deduplicated notifications,
 * and automatically transitions expired batches to status EXPIRED.
 */
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');

const THRESHOLDS = [1, 7, 14, 30, 60, 90]; // days

async function runExpiryAlertJob() {
  try {
    console.log('[ExpiryAlertJob] Running expiry check and status transition...');
    const now = new Date();

    for (const days of THRESHOLDS) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);

      const batches = await Batch.find({
        status: { $in: ['ACTIVE', 'AVAILABLE'] },
        expiryDate: {
          $lte: cutoff,
          $gt: days === 1 ? new Date(now.getTime() - 86400000) : new Date(cutoff.getTime() - 86400000 * (THRESHOLDS[THRESHOLDS.indexOf(days) + 1] || days)),
        },
      }).populate('productId', 'name sku hospitalId');

      for (const batch of batches) {
        if (!batch.productId) continue;
        const hospitalId = batch.productId.hospitalId;
        const title = `Expiry Alert (${days}d): ${batch.productId.name}`;

        // Deduplication check: Do not re-create duplicate notification for same batch & threshold today
        const existing = await Notification.findOne({
          hospitalId,
          resourceId: batch._id,
          type: 'NEAR_EXPIRY',
          createdAt: { $gt: new Date(now.getTime() - 86400000) }
        });

        if (!existing) {
          const priority = days <= 7 ? 'CRITICAL' : days <= 30 ? 'HIGH' : 'MEDIUM';
          await createNotification({
            hospitalId,
            recipientRole: 'store_manager',
            type: 'NEAR_EXPIRY',
            title,
            message: `Batch ${batch.batchNumber} of ${batch.productId.name} expires on ${new Date(batch.expiryDate).toDateString()}.`,
            priority,
            resourceType: 'Batch',
            resourceId: batch._id,
          });
        }
      }
    }

    // Flag and automatically transition truly expired batches to EXPIRED status
    const expiredBatches = await Batch.find({
      status: { $in: ['ACTIVE', 'AVAILABLE'] },
      expiryDate: { $lt: now },
    }).populate('productId', 'name sku hospitalId');

    for (const batch of expiredBatches) {
      if (!batch.productId) continue;
      
      // Automatically quarantine/block expired batch from FEFO selection
      batch.status = 'EXPIRED';
      await batch.save();

      const hospitalId = batch.productId.hospitalId;
      const existing = await Notification.findOne({
        hospitalId,
        resourceId: batch._id,
        type: 'EXPIRED'
      });

      if (!existing) {
        await createNotification({
          hospitalId,
          recipientRole: 'store_manager',
          type: 'EXPIRED',
          title: `EXPIRED: ${batch.productId.name}`,
          message: `Batch ${batch.batchNumber} of ${batch.productId.name} has expired and was automatically blocked from issue.`,
          priority: 'CRITICAL',
          resourceType: 'Batch',
          resourceId: batch._id,
        });
      }
    }

    console.log('[ExpiryAlertJob] Done.');
  } catch (err) {
    console.error('[ExpiryAlertJob] Error:', err.message);
  }
}

function startExpiryAlertJob() {
  runExpiryAlertJob(); // run immediately on startup
  setInterval(runExpiryAlertJob, 60 * 60 * 1000); // every hour
}

module.exports = { startExpiryAlertJob, runExpiryAlertJob };
