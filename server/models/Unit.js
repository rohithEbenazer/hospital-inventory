const mongoose = require('mongoose');

const unitConversionSchema = new mongoose.Schema({
  toUnit:           { type: String, required: true }, // e.g. Gloves, Vials, Pieces
  conversionFactor: { type: Number, required: true, min: 0.0001 } // e.g. 100
}, { _id: false });

const unitSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  name:             { type: String, required: true }, // e.g. Box, Carton, Pack, Piece, Vial, Ampoule, Tablet
  abbreviation:     { type: String, required: true }, // e.g. BX, CTN, PC, VIAL
  description:      { type: String },
  conversions:      [unitConversionSchema],
  isActive:         { type: Boolean, default: true }
}, { timestamps: true });

unitSchema.index({ hospitalId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Unit', unitSchema);
