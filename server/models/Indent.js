const mongoose = require('mongoose');

const IndentItemSchema = new mongoose.Schema({
  productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:       { type: String, required: true },
  productName:      { type: String, required: true },
  requestedQty:     { type: Number, required: true },
  issuedQty:        { type: Number, default: 0 },
  unit:             { type: String, default: 'Piece' },
  batchAllocations: [{
    batchNumber: String,
    expiryDate: Date,
    quantity: Number
  }]
}, { _id: false });

const IndentSchema = new mongoose.Schema({
  indentNumber:           { type: String, required: true, unique: true },
  hospitalId:             { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  requestingDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName:         { type: String, required: true }, // e.g. ICU, OT, Ward 3, Lab
  requesterId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedBy:            { type: String, required: true },
  sourceWarehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  requestingStore:        { type: String, default: 'Department Sub-store' },
  targetStore:            { type: String, default: 'Central Store' },
  priority:               { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
  reason:                 { type: String },
  requiredDate:           { type: Date },
  items:                  [IndentItemSchema],
  status: {
    type: String,
    enum: [
      'DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED',
      'REJECTED', 'PICKING', 'PARTIALLY_ISSUED', 'ISSUED', 'RECEIVED', 'CANCELLED'
    ],
    default: 'SUBMITTED'
  },
  approvedBy:             { type: String },
  issuedBy:               { type: String },
  receivedBy:             { type: String },
  remarks:                { type: String }
}, { timestamps: true });

IndentSchema.index({ hospitalId: 1, indentNumber: 1 }, { unique: true });

module.exports = mongoose.model('Indent', IndentSchema);
