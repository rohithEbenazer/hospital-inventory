const mongoose = require('mongoose');

const workflowRuleSchema = new mongoose.Schema({
  hospitalId:      { type: mongoose.Schema.Types.Mixed, required: true },
  ruleName:        { type: String, required: true },
  moduleType:      { type: String, enum: ['STOCK_ADJUSTMENT', 'PURCHASE_ORDER', 'INDENT_APPROVAL', 'WRITE_OFF'], required: true },
  thresholdAmount: { type: Number, required: true }, // e.g. 50000
  currency:        { type: String, default: 'INR' },
  approvalChain:   [{ stepOrder: Number, requiredRole: String, roleTitle: String }],
  isActive:        { type: Boolean, default: true },
  effectiveFrom:   { type: Date, default: Date.now }
}, { timestamps: true });

workflowRuleSchema.index({ hospitalId: 1, moduleType: 1, isActive: 1 });

module.exports = mongoose.model('WorkflowRule', workflowRuleSchema);
