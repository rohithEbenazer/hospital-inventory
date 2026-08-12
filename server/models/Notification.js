const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  hospitalId:    { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  recipientId:   { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  recipientRole: { type: String, default: 'store_manager' },
  type:          {
    type: String,
    enum: [
      'LOW_STOCK', 'OUT_OF_STOCK', 'NEAR_EXPIRY', 'EXPIRED', 'RECALLED',
      'PENDING_INDENT', 'PENDING_APPROVAL', 'PO_DELAY', 'GRN_PENDING',
      'STOCK_VARIANCE', 'EQUIPMENT_WARRANTY_EXPIRY', 'AMC_EXPIRY',
      'CALIBRATION_DUE', 'PURCHASE_ORDER_APPROVED', 'GRN_POSTED',
      'RECALL_CREATED', 'INDENT_APPROVED', 'STOCK_ADJUSTED', 'SYSTEM'
    ],
    required: true
  },
  channels:      [{ type: String, enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH_NOTIFICATION'], default: ['IN_APP'] }],
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  priority:      { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  resourceType:  { type: String }, // e.g. Product, PurchaseOrder, Batch, MedicalAsset
  resourceId:    { type: mongoose.Schema.Types.ObjectId },
  deliveryStatus:{
    inApp:  { type: Boolean, default: true },
    email:  { type: Boolean, default: false },
    sms:    { type: Boolean, default: false },
    push:   { type: Boolean, default: false }
  },
  isRead:        { type: Boolean, default: false },
  readAt:        { type: Date }
}, { timestamps: true });

notificationSchema.index({ hospitalId: 1, recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ hospitalId: 1, recipientRole: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
