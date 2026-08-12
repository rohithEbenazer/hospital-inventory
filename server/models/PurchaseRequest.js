const mongoose = require('mongoose');

const PRItemSchema = new mongoose.Schema({
  productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:        { type: String, required: true },
  productName:       { type: String, required: true },
  requiredQty:       { type: Number, required: true },
  estimatedUnitCost: { type: Number, default: 0 },
  justification:     { type: String }
}, { _id: false });

const PurchaseRequestSchema = new mongoose.Schema({
  hospitalId:             { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  requestNumber:          { type: String, required: true, unique: true }, // Alias prNumber
  prNumber:               { type: String },
  requestingDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName:         { type: String, default: 'Central Store' },
  requestedBy:            { type: String, required: true },
  priority:               { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
  reason:                 { type: String },
  requiredByDate:         { type: Date },
  items:                  [PRItemSchema],
  status: {
    type: String,
    enum: [
      'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED',
      'REJECTED', 'CONVERTED_TO_RFQ', 'CONVERTED_TO_PO', 'CANCELLED'
    ],
    default: 'SUBMITTED'
  },
  approvedBy:             { type: String },
  approvedAt:             { type: Date },
  rejectionReason:        { type: String }
}, { timestamps: true });

PurchaseRequestSchema.index({ hospitalId: 1, requestNumber: 1 }, { unique: true });

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema);
