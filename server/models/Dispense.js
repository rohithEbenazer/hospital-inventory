const mongoose = require('mongoose');

const DispenseItemSchema = new mongoose.Schema({
  productId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:      { type: String },
  productName:     { type: String, required: true },
  batchId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  batchNumber:     { type: String, required: true },
  expiryDate:      { type: Date },
  prescribedQty:   { type: Number },
  dispensedQty:    { type: Number, required: true },
  quantity:        { type: Number, required: true },
  unitCost:        { type: Number, required: true },
  mrp:             { type: Number, required: true },
  totalAmount:     { type: Number, required: true },
  isSubstitute:    { type: Boolean, default: false },
  originalProduct: { type: String },
  substituteReason:{ type: String }
}, { _id: false });

const DispenseSchema = new mongoose.Schema({
  hospitalId:             { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  dispenseNumber:         { type: String, required: true, unique: true },
  patientId:              { type: String, required: true }, // e.g. PAT-2026-9081
  patientName:            { type: String, required: true },
  doctorName:             { type: String, required: true },
  prescriptionId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  prescriptionNo:         { type: String },
  pharmacistName:         { type: String, required: true },
  witnessPharmacistName:  { type: String }, // Required for Controlled Narcotics
  items:                  [DispenseItemSchema],
  totalBillAmount:        { type: Number, required: true },
  paymentStatus:          { type: String, enum: ['PAID', 'PENDING', 'INSURANCE_CLAIM'], default: 'PAID' },
  dispenseStatus:         { type: String, enum: ['FULL', 'PARTIAL', 'CANCELLED'], default: 'FULL' },
  controlledDrugVerified: { type: Boolean, default: false }
}, { timestamps: true });

DispenseSchema.index({ hospitalId: 1, dispenseNumber: 1 }, { unique: true });
DispenseSchema.index({ hospitalId: 1, patientId: 1 });

module.exports = mongoose.model('Dispense', DispenseSchema);
