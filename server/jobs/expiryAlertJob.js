/**
 * expiryAlertJob — runs on startup and every hour
 * Checks batches expiring in 90/60/30/14/7/1 days and creates notifications
 */
const Batch = require('../models/Batch');
const { createNotification } = require('../services/notificationService');

const THRESHOLDS = [1, 7, 14, 30, 60, 90]; // days

async function runExpiryAlertJob() {
  try {
    console.log('[ExpiryAlertJob] Running expiry check...');
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
        const priority = days <= 7 ? 'CRITICAL' : days <= 30 ? 'HIGH' : 'MEDIUM';
        await createNotification({
          hospitalId: batch.productId.hospitalId,
          recipientRole: 'store_manager',
          type: 'NEAR_EXPIRY',
          title: `Expiry Alert (${days}d): ${batch.productId.name}`,
          message: `Batch ${batch.batchNumber} of ${batch.productId.name} expires on ${new Date(batch.expiryDate).toDateString()}.`,
          priority,
          resourceType: 'Batch',
          resourceId: batch._id,
        });
      }
    }

    // Flag truly expired batches
    const expired = await Batch.find({
      status: { $in: ['ACTIVE', 'AVAILABLE'] },
      expiryDate: { $lt: now },
    }).populate('productId', 'name sku hospitalId');

    for (const batch of expired) {
      if (!batch.productId) continue;
      await createNotification({
        hospitalId: batch.productId.hospitalId,
        recipientRole: 'store_manager',
        type: 'EXPIRED',
        title: `EXPIRED: ${batch.productId.name}`,
        message: `Batch ${batch.batchNumber} of ${batch.productId.name} has expired. Action required.`,
        priority: 'CRITICAL',
        resourceType: 'Batch',
        resourceId: batch._id,
      });
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
