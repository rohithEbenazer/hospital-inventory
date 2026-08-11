const mongoose = require('mongoose');

const GRNItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  orderedQty: { type: Number, required: true },
  receivedQty: { type: Number, required: true },
  acceptedQty: { type: Number, required: true },
  rejectedQty: { type: Number, default: 0 },
  batchNumber: { type: String, required: true },
  physicalExpiryDate: { type: Date, required: true }, // ACTUAL delivered batch expiry!
  manufactureDate: { type: Date },
  unitCost: { type: Number, required: true },
  mrp: { type: Number, required: true },
  qcStatus: { type: String, enum: ['PASSED', 'QUARANTINED', 'REJECTED'], default: 'PASSED' },
  qcRemarks: { type: String }
});

const GoodsReceiptSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  grnNumber: { type: String, required: true, unique: true },
  poNumber: { type: String, required: true },
  supplierName: { type: String, required: true },
  receivedStore: { type: String, default: 'Central Store' },
  receivedBy: { type: String, required: true },
  deliveryChallanNo: { type: String },
  invoiceNumber: { type: String },
  qcInspectorName: { type: String },
  items: [GRNItemSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'QC_PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  }
}, { timestamps: true });

module.exports = mongoose.model('GoodsReceipt', GoodsReceiptSchema);
