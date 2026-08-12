const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSku:  { type: String },
  productName: { type: String, required: true },
  unitPrice:   { type: Number, required: true, min: 0 },
  quantity:    { type: Number, required: true, min: 1 },
  discount:    { type: Number, default: 0 },
  tax:         { type: Number, default: 0 },
  lineTotal:   { type: Number }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  rfqId:        { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  rfqNumber:    { type: String },
  supplierId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  items:        [quotationItemSchema],
  subtotal:     { type: Number, default: 0 },
  tax:          { type: Number, default: 0 },
  discount:     { type: Number, default: 0 },
  shipping:     { type: Number, default: 0 },
  grandTotal:   { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 7 },
  paymentTerms: { type: String, default: 'Net 30 Days' },
  validUntil:   { type: Date, required: true, default: () => new Date(Date.now() + 30*86400000) },
  attachments:  [{ url: String, name: String }],
  status:       { type: String, enum: ['RECEIVED', 'SELECTED', 'REJECTED', 'EXPIRED'], default: 'RECEIVED' },
  notes:        { type: String }
}, { timestamps: true });

quotationSchema.index({ hospitalId: 1, rfqId: 1 });
quotationSchema.index({ hospitalId: 1, supplierId: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
