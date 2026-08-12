const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true },
  warehouseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  name:         { type: String, required: true, trim: true },
  zone:         { type: String, trim: true },
  aisle:        { type: String, trim: true },
  rack:         { type: String, trim: true },
  bin:          { type: String, trim: true },
  barcode:      { type: String, trim: true },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

locationSchema.index({ hospitalId: 1, warehouseId: 1 });
locationSchema.index({ barcode: 1 });

module.exports = mongoose.model('Location', locationSchema);
