const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  drugLicenseNo: { type: String },
  rating: { type: Number, default: 4.5 },
  categoriesSupplied: [{ type: String }],
  paymentTerms: { type: String, default: 'Net 30' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'BLACKLISTED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
