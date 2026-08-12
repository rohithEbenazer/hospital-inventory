const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  hospitalId:  { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  userId:      { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  performedBy: { type: String, required: true },
  role:        { type: String, required: true },
  userRole:    { type: String },
  action:      { type: String, required: true }, // e.g. PRODUCT_CREATED, STOCK_ISSUED, PO_APPROVED, GRN_POSTED
  module:      { type: String, default: 'SYSTEM' },
  resource:    { type: String, required: true }, // e.g. Product, StockIssue, PurchaseOrder
  resourceId:  { type: mongoose.Schema.Types.ObjectId },
  oldValues:   { type: mongoose.Schema.Types.Mixed },
  newValues:   { type: mongoose.Schema.Types.Mixed },
  ipAddress:   { type: String, default: '127.0.0.1' },
  userAgent:   { type: String, default: 'Hospital-Inventory-Client/1.0' },
  timestamp:   { type: Date, default: Date.now },
  reason:      { type: String },
  requestId:   { type: String },
  details:     { type: String }
}, { timestamps: true });

// Section 60 Immutability Guard: Append-Only Audit Trail
AuditLogSchema.pre('updateOne', function () {
  throw new Error('IMMUTABLE_AUDIT_LOG: Audit logs are append-only and cannot be modified.');
});

AuditLogSchema.pre('deleteOne', function () {
  throw new Error('IMMUTABLE_AUDIT_LOG: Audit logs are append-only and cannot be deleted.');
});

AuditLogSchema.index({ hospitalId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ hospitalId: 1, resource: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
