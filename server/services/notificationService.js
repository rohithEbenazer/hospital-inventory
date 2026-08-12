const Notification = require('../models/Notification');

/**
 * Section 39 Multi-Channel Notification Engine
 * Supports: IN_APP, EMAIL, SMS, PUSH_NOTIFICATION
 */
async function createNotification({
  hospitalId = 'HOSP-001',
  recipientId,
  recipientRole = 'store_manager',
  type,
  title,
  message,
  priority = 'MEDIUM',
  resourceType,
  resourceId,
  channels = ['IN_APP', 'EMAIL']
}) {
  try {
    return await Notification.create({
      hospitalId,
      recipientId,
      recipientRole,
      type,
      channels,
      title,
      message,
      priority,
      resourceType,
      resourceId,
      deliveryStatus: {
        inApp: channels.includes('IN_APP'),
        email: channels.includes('EMAIL'),
        sms: channels.includes('SMS'),
        push: channels.includes('PUSH_NOTIFICATION')
      }
    });
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
}

async function notifyLowStock({ hospitalId, productId, productName, currentQty, reorderPoint }) {
  await createNotification({
    hospitalId,
    recipientRole: 'store_manager',
    type: currentQty === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    title: `${currentQty === 0 ? 'Out of Stock' : 'Low Stock'}: ${productName}`,
    message: `${productName} has ${currentQty} units remaining (reorder point: ${reorderPoint}).`,
    priority: currentQty === 0 ? 'CRITICAL' : 'HIGH',
    resourceType: 'Product',
    resourceId: productId,
    channels: ['IN_APP', 'EMAIL', 'SMS']
  });
}

async function notifyNearExpiry({ hospitalId, productId, productName, batchNumber, expiryDate, daysLeft }) {
  const priority = daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 30 ? 'HIGH' : 'MEDIUM';
  await createNotification({
    hospitalId,
    recipientRole: 'store_manager',
    type: daysLeft <= 0 ? 'EXPIRED' : 'NEAR_EXPIRY',
    title: `${daysLeft <= 0 ? 'Stock Expired' : 'Near Expiry'}: ${productName}`,
    message: `Batch ${batchNumber} of ${productName} expires on ${new Date(expiryDate).toDateString()} (${daysLeft} days left).`,
    priority,
    resourceType: 'Product',
    resourceId: productId,
    channels: ['IN_APP', 'EMAIL', 'PUSH_NOTIFICATION']
  });
}

async function notifyAssetMaintenance({ hospitalId, assetId, serialNumber, productName, alertType, dueDate }) {
  await createNotification({
    hospitalId,
    recipientRole: 'biomedical_engineer',
    type: alertType, // 'EQUIPMENT_WARRANTY_EXPIRY' | 'AMC_EXPIRY' | 'CALIBRATION_DUE'
    title: `Asset Maintenance Alert: ${productName} (${serialNumber})`,
    message: `${alertType.replace(/_/g, ' ')} due on ${new Date(dueDate).toDateString()}.`,
    priority: 'HIGH',
    resourceType: 'MedicalAsset',
    resourceId: assetId,
    channels: ['IN_APP', 'EMAIL', 'PUSH_NOTIFICATION']
  });
}

module.exports = {
  createNotification,
  notifyLowStock,
  notifyNearExpiry,
  notifyAssetMaintenance
};
