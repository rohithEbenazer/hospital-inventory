const mongoose = require('mongoose');

const InventoryBalanceSchema = new mongoose.Schema({
  hospitalId:     { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  productId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:     { type: String, required: true },
  productName:    { type: String, required: true },
  warehouseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName:  { type: String, required: true, default: 'Central Main Warehouse' },
  locationId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  locationCode:   { type: String, default: 'CENTRAL-01 / A / R01 / S01 / B01' },
  batchId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  batchNumber:    { type: String },
  serialNumberId: { type: mongoose.Schema.Types.ObjectId, ref: 'SerialNumber' },
  serialNumber:   { type: String },
  
  // Quantities per stock state
  availableQty:   { type: Number, default: 0, min: 0 },
  reservedQty:    { type: Number, default: 0, min: 0 },
  allocatedQty:   { type: Number, default: 0, min: 0 },
  inTransitQty:   { type: Number, default: 0, min: 0 },
  damagedQty:     { type: Number, default: 0, min: 0 },
  quarantinedQty: { type: Number, default: 0, min: 0 },
  expiredQty:     { type: Number, default: 0, min: 0 },

  // Valuation
  averageCost:    { type: Number, default: 0 },
  lastCost:       { type: Number, default: 0 },
  unitCost:       { type: Number, default: 0 },
  stockValue:     { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save stock valuation calculation
InventoryBalanceSchema.pre('save', function (next) {
  const cost = this.averageCost || this.unitCost || 0;
  this.stockValue = (this.availableQty || 0) * cost;
  next();
});

// Section 13 Composite Stock Balance Index
InventoryBalanceSchema.index(
  { hospitalId: 1, productId: 1, warehouseId: 1, locationId: 1, batchId: 1, serialNumberId: 1 },
  { sparse: true }
);

module.exports = mongoose.model('InventoryBalance', InventoryBalanceSchema);
