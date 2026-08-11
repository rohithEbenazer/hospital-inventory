const mongoose = require('mongoose');

const DispenseItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  mrp: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const DispenseSchema = new mongoose.Schema({
  dispenseNumber: { type: String, required: true, unique: true },
  patientId: { type: String, required: true }, // e.g. PAT-2026-9081
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  prescriptionId: { type: String },
  pharmacistName: { type: String, required: true },
  items: [DispenseItemSchema],
  totalBillAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'INSURANCE_CLAIM'], default: 'PAID' },
  controlledDrugVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Dispense', DispenseSchema);
