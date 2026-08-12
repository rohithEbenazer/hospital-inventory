const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  lineTotal: { type: Number },
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [quotationItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  deliveryDays: { type: Number },
  paymentTerms: { type: String },
  validUntil: { type: Date },
  attachments: [{ url: String, name: String }],
  status: { type: String, enum: ['RECEIVED', 'SELECTED', 'REJECTED', 'EXPIRED'], default: 'RECEIVED' },
  notes: { type: String },
}, { timestamps: true });

quotationSchema.index({ hospitalId: 1, rfqId: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
