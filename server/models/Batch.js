const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  lotNumber: { type: String },
  manufacturer: { type: String },
  manufactureDate: { type: Date },
  expiryDate: { type: Date, required: true },
  receivedDate: { type: Date, default: Date.now },
  supplierName: { type: String },
  purchaseOrderNo: { type: String },
  grnNo: { type: String },
  quantityReceived: { type: Number, required: true },
  currentQuantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  mrp: { type: Number, required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName: { type: String, default: 'Central Store' },
  locationCode: { type: String, default: 'LOC-A1' },
  qualityStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'QUARANTINED', 'REJECTED'],
    default: 'APPROVED'
  },
  recallStatus: {
    type: String,
    enum: ['NORMAL', 'RECALLED', 'PARTIALLY_RECALLED'],
    default: 'NORMAL'
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'EXPIRED', 'QUARANTINED', 'RECALLED', 'EMPTY'],
    default: 'AVAILABLE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);
