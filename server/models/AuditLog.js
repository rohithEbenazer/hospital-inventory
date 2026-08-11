const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. PRODUCT_CREATED, INDENT_APPROVED, GRN_RECEIVED
  module: { type: String, required: true }, // e.g. PRODUCT, INDENT, PROCUREMENT, PHARMACY
  performedBy: { type: String, required: true },
  userRole: { type: String, required: true },
  details: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
