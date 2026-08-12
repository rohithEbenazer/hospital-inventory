const mongoose = require('mongoose');

const binLocationSchema = new mongoose.Schema({
  hospitalId:    { type: mongoose.Schema.Types.Mixed, required: true },
  warehouseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  zoneCode:      { type: String, required: true }, // e.g. ZONE-A (Cold Storage)
  rackCode:      { type: String, required: true }, // e.g. RACK-04
  shelfCode:     { type: String, required: true }, // e.g. SHELF-02
  binCode:       { type: String, required: true, unique: true }, // e.g. BIN-A42-01
  barcode:       { type: String, required: true, unique: true },
  capacityUnits: { type: Number, default: 500 },
  currentItems:  { type: Number, default: 0 },
  status:        { type: String, enum: ['ACTIVE', 'FULL', 'MAINTENANCE', 'BLOCKED'], default: 'ACTIVE' }
}, { timestamps: true });

binLocationSchema.index({ hospitalId: 1, warehouseId: 1, binCode: 1 });

module.exports = mongoose.model('BinLocation', binLocationSchema);
