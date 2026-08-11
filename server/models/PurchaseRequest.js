const mongoose = require('mongoose');

const PRItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  requiredQty: { type: Number, required: true },
  estimatedUnitCost: { type: Number, default: 0 },
  justification: { type: String }
});

const PurchaseRequestSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  prNumber: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true },
  requestedBy: { type: String, required: true },
  priority: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
  items: [PRItemSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED_TO_RFQ', 'CONVERTED_TO_PO'],
    default: 'SUBMITTED'
  },
  approvedBy: { type: String },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema);
