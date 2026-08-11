const mongoose = require('mongoose');

const IndentItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  requestedQty: { type: Number, required: true },
  issuedQty: { type: Number, default: 0 },
  unit: { type: String, default: 'Piece' },
  batchAllocations: [{
    batchNumber: String,
    expiryDate: Date,
    quantity: Number
  }]
});

const IndentSchema = new mongoose.Schema({
  indentNumber: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true }, // e.g. ICU, OT, Ward 3, Lab
  requestingStore: { type: String, default: 'Department Sub-store' },
  targetStore: { type: String, default: 'Central Store' },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  priority: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
  items: [IndentItemSchema],
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_ISSUED', 'FULFILLED', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Indent', IndentSchema);
