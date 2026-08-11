const mongoose = require('mongoose');

const ControlledDrugLedgerSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  transactionNumber: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  pharmacistId: { type: String, required: true },
  witnessId: { type: String, required: true }, // Mandatory dual signoff witness!
  balanceAfter: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ControlledDrugLedger', ControlledDrugLedgerSchema);
