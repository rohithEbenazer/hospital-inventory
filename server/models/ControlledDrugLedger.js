const mongoose = require('mongoose');

const ControlledDrugLedgerSchema = new mongoose.Schema({
  hospitalId:         { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  transactionNumber:  { type: String, required: true, unique: true },
  productId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName:        { type: String, required: true },
  batchNumber:        { type: String, required: true },
  quantity:           { type: Number, required: true },
  quantityLimit:      { type: Number, default: 10 },
  patientId:          { type: String, required: true },
  patientName:        { type: String, required: true },
  doctorName:         { type: String, required: true },
  prescriptionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  prescriptionNo:     { type: String },
  pharmacistId:       { type: String, required: true },
  pharmacistName:     { type: String, required: true },
  witnessId:          { type: String, required: true }, // Mandatory dual signoff witness!
  witnessName:        { type: String, required: true },
  isCorrection:       { type: Boolean, default: false },
  correctionReason:   { type: String },
  managerApprovedBy:  { type: String },
  balanceAfter:       { type: Number, required: true },
  timestamp:          { type: Date, default: Date.now }
}, { timestamps: true });

ControlledDrugLedgerSchema.index({ hospitalId: 1, transactionNumber: 1 }, { unique: true });
ControlledDrugLedgerSchema.index({ hospitalId: 1, patientId: 1 });

module.exports = mongoose.model('ControlledDrugLedger', ControlledDrugLedgerSchema);
