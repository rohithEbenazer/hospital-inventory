const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  supplierId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  contractNumber:   { type: String, trim: true },
  title:            { type: String, required: true },
  startDate:        { type: Date, required: true },
  endDate:          { type: Date, required: true },
  value:            { type: Number, default: 0 },
  paymentTerms:     { type: String },
  deliveryTerms:    { type: String },
  terms:            { type: String }, // full text
  attachments:      [{ url: String, name: String }],
  status:           { type: String, enum: ['ACTIVE','EXPIRED','TERMINATED','DRAFT'], default: 'DRAFT' },
  renewalAlert:     { type: Number, default: 30 }, // days before expiry to alert
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

contractSchema.index({ hospitalId: 1, supplierId: 1 });
contractSchema.index({ hospitalId: 1, endDate: 1, status: 1 });

module.exports = mongoose.model('SupplierContract', contractSchema);
