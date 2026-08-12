const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  warehouseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  warehouseCode:{ type: String, default: 'WH-CENTRAL' },
  zone:         { type: String, default: 'A', trim: true },
  rack:         { type: String, default: 'R01', trim: true },
  shelf:        { type: String, default: 'S01', trim: true },
  bin:          { type: String, default: 'B01', trim: true },
  formattedCode:{ type: String }, // e.g. CENTRAL-01 / A / R03 / S02 / B05
  barcode:      { type: String, trim: true },
  capacityUnits:{ type: Number, default: 500 },
  currentUnits: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

locationSchema.pre('save', function (next) {
  if (!this.formattedCode) {
    this.formattedCode = `${this.warehouseCode} / ${this.zone} / ${this.rack} / ${this.shelf} / ${this.bin}`;
  }
  if (!this.barcode) {
    this.barcode = `${this.warehouseCode}-${this.zone}-${this.rack}-${this.shelf}-${this.bin}`.replace(/\s+/g, '');
  }
  next();
});

locationSchema.index({ hospitalId: 1, warehouseId: 1, formattedCode: 1 });
locationSchema.index({ barcode: 1 });

module.exports = mongoose.model('Location', locationSchema);
