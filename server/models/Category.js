const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  name:         { type: String, required: true },
  code:         { type: String, required: true },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  description:  { type: String },
  itemType:     { type: String, required: true, default: 'MEDICINE' },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ hospitalId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
