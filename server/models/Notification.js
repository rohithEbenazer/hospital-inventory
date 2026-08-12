const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  hospitalId:    { type: mongoose.Schema.Types.Mixed, required: true },
  recipientId:   { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  recipientRole: { type: String }, // broadcast to role if recipientId not set
  type:          {
    type: String,
    enum: [
      'LOW_STOCK','OUT_OF_STOCK','NEAR_EXPIRY','EXPIRED','RECALLED',
      'PENDING_INDENT','PENDING_APPROVAL','PO_DELAY','GRN_PENDING',
      'STOCK_VARIANCE','EQUIPMENT_WARRANTY_EXPIRY','AMC_EXPIRY',
      'CALIBRATION_DUE','PURCHASE_ORDER_APPROVED','GRN_POSTED',
      'RECALL_CREATED','INDENT_APPROVED','STOCK_ADJUSTED','SYSTEM'
    ],
    required: true
  },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  priority:      { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  resourceType:  { type: String }, // 'Product','PurchaseOrder','Batch', etc.
  resourceId:    { type: mongoose.Schema.Types.ObjectId },
  isRead:        { type: Boolean, default: false },
  readAt:        { type: Date },
}, { timestamps: true });

notificationSchema.index({ hospitalId: 1, recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ hospitalId: 1, recipientRole: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
