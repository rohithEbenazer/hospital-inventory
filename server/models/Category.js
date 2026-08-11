const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  parentCategory: { type: String, default: null },
  itemType: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
