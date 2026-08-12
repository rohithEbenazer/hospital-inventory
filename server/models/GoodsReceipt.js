const mongoose = require('mongoose');

const GRNItemSchema = new mongoose.Schema({
  productId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:         { type: String, required: true },
  productName:        { type: String, required: true },
  orderedQty:         { type: Number, required: true },
  receivedQty:        { type: Number, required: true },
  acceptedQty:        { type: Number, required: true },
  rejectedQty:        { type: Number, default: 0 },
  batchNumber:        { type: String, required: true },
  physicalExpiryDate: { type: Date, required: true },
  manufactureDate:    { type: Date },
  unitCost:           { type: Number, required: true },
  mrp:                { type: Number, required: true },
  qcStatus:           { type: String, enum: ['PASSED', 'QUARANTINED', 'REJECTED'], default: 'PASSED' },
  qcRemarks:          { type: String }
}, { _id: false });

const GoodsReceiptSchema = new mongoose.Schema({
  hospitalId:         { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  grnNumber:          { type: String, required: true, unique: true },
  poId:               { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  poNumber:           { type: String, required: true },
  supplierId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName:       { type: String, required: true },
  warehouseId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  receivedStore:      { type: String, default: 'Central Store' },
  receivedDate:       { type: Date, default: Date.now },
  receivedBy:         { type: String, required: true },
  verifiedBy:         { type: String, default: 'QC Inspector' },
  deliveryChallanNo:  { type: String },
  invoiceNumber:      { type: String },
  qcInspectorName:    { type: String },
  qualityCheck:       { type: String, enum: ['PASSED', 'FAILED', 'PARTIAL'], default: 'PASSED' },
  items:              [GRNItemSchema],
  attachments:        [{ url: String, name: String }],
  status: {
    type: String,
    enum: [
      'DRAFT', 'RECEIVED', 'UNDER_INSPECTION', 'APPROVED',
      'PARTIALLY_ACCEPTED', 'REJECTED', 'POSTED'
    ],
    default: 'POSTED'
  }
}, { timestamps: true });

GoodsReceiptSchema.index({ hospitalId: 1, grnNumber: 1 }, { unique: true });

module.exports = mongoose.model('GoodsReceipt', GoodsReceiptSchema);
