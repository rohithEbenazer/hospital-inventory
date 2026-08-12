const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:       { type: String, required: true },
  productName:      { type: String, required: true },
  batchNumber:      { type: String, required: true },
  lotNumber:        { type: String },
  manufacturerId:   { type: String },
  manufacturer:     { type: String, default: 'Pharma Manufacturer' },
  manufactureDate:  { type: Date },
  expiryDate:       { type: Date, required: true },
  receivedDate:     { type: Date, default: Date.now },
  supplierId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName:     { type: String },
  purchaseOrderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  purchaseOrderNo:  { type: String },
  grnId:            { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  grnNo:            { type: String },
  quantityReceived: { type: Number, required: true },
  currentQuantity:  { type: Number, required: true },
  unitCost:         { type: Number, required: true },
  mrp:              { type: Number, required: true },
  warehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName:    { type: String, default: 'Central Main Warehouse' },
  locationCode:     { type: String, default: 'CENTRAL-01 / A / R01 / S01 / B01' },
  storageCondition: { type: String, default: 'Room Temp (20-25°C)' },
  temperatureRange: { type: String, default: '15-25°C' },
  
  // Section 15 Quality & Recall Statuses
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

// Section 15 Compound Index for Batch Number per hospital & product
BatchSchema.index({ hospitalId: 1, productId: 1, batchNumber: 1 }, { unique: true });
BatchSchema.index({ hospitalId: 1, expiryDate: 1 });

module.exports = mongoose.model('Batch', BatchSchema);
