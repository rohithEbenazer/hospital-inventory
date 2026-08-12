const mongoose = require('mongoose');

const rfqItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSku:  { type: String, required: true },
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true }
}, { _id: false });

const RFQSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  rfqNumber:        { type: String, required: true, unique: true },
  prNumber:         { type: String },
  supplierIds:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }],
  invitedSuppliers: [{ type: String }],
  items:            [rfqItemSchema],
  quotationDeadline:{ type: Date, required: true, default: () => new Date(Date.now() + 7*86400000) },
  terms:            { type: String, default: 'Standard Hospital Supply SLA' },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'QUOTATIONS_RECEIVED', 'EVALUATED', 'AWARDED', 'CANCELLED'],
    default: 'PUBLISHED'
  },
  createdBy:        { type: String, default: 'Procurement Officer' },
  awardedSupplierName: { type: String }
}, { timestamps: true });

RFQSchema.index({ hospitalId: 1, rfqNumber: 1 }, { unique: true });

module.exports = mongoose.model('RFQ', RFQSchema);
