const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Box, Piece, Vial, Bottle
  abbreviation: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Unit', UnitSchema);
