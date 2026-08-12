/**
 * NotificationService — create in-app notifications for key events
 */
const Notification = require('../models/Notification');

async function createNotification({ hospitalId, recipientId, recipientRole, type, title, message, priority = 'MEDIUM', resourceType, resourceId }) {
  try {
    await Notification.create({
      hospitalId,
      recipientId,
      recipientRole,
      type,
      title,
      message,
      priority,
      resourceType,
      resourceId,
    });
  } catch (err) {
    // Notification failure must never break main flow
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
}

async function notifyLowStock({ hospitalId, productId, productName, currentQty, reorderPoint }) {
  await createNotification({
    hospitalId,
    recipientRole: 'store_manager',
    type: 'LOW_STOCK',
    title: `Low Stock: ${productName}`,
    message: `${productName} has ${currentQty} units remaining (reorder point: ${reorderPoint}). Please initiate a purchase request.`,
    priority: currentQty === 0 ? 'CRITICAL' : 'HIGH',
    resourceType: 'Product',
    resourceId: productId,
  });
}

async function notifyNearExpiry({ hospitalId, productId, productName, batchNumber, expiryDate, daysLeft }) {
  const priority = daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 30 ? 'HIGH' : 'MEDIUM';
  await createNotification({
    hospitalId,
    recipientRole: 'store_manager',
    type: 'NEAR_EXPIRY',
    title: `Near Expiry: ${productName}`,
    message: `Batch ${batchNumber} of ${productName} expires on ${new Date(expiryDate).toDateString()} (${daysLeft} days left).`,
    priority,
    resourceType: 'Product',
    resourceId: productId,
  });
}

async function notifyPendingApproval({ hospitalId, recipientId, resourceType, resourceId, resourceNumber }) {
  await createNotification({
    hospitalId,
    recipientId,
    type: 'PENDING_APPROVAL',
    title: `Approval Required: ${resourceType} ${resourceNumber}`,
    message: `${resourceType} ${resourceNumber} is awaiting your approval.`,
    priority: 'HIGH',
    resourceType,
    resourceId,
  });
}

async function notifyRecall({ hospitalId, productName, batchNumbers, reason }) {
  await createNotification({
    hospitalId,
    recipientRole: 'admin',
    type: 'RECALLED',
    title: `Recall Initiated: ${productName}`,
    message: `A recall has been initiated for ${productName}. Affected batches: ${batchNumbers.join(', ')}. Reason: ${reason}`,
    priority: 'CRITICAL',
  });
}

module.exports = { createNotification, notifyLowStock, notifyNearExpiry, notifyPendingApproval, notifyRecall };
