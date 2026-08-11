const mongoose = require('mongoose');

const QuotationResponseSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  quotedPrice: { type: Number, required: true },
  deliveryLeadTimeDays: { type: Number, default: 7 },
  validUntil: { type: Date },
  selected: { type: Boolean, default: false },
  remarks: { type: String }
});

const RFQSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  rfqNumber: { type: String, required: true, unique: true },
  prNumber: { type: String },
  title: { type: String, required: true },
  invitedSuppliers: [{ type: String }],
  quotationResponses: [QuotationResponseSchema],
  status: {
    type: String,
    enum: ['PUBLISHED', 'QUOTATIONS_RECEIVED', 'EVALUATED', 'AWARDED', 'CANCELLED'],
    default: 'PUBLISHED'
  },
  awardedSupplierName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RFQ', RFQSchema);
