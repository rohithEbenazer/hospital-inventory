const mongoose = require('mongoose');

const patientConsumptionSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  patientId:    { type: String, required: true },
  encounterId:  { type: String },
  admissionId:  { type: String },
  procedureId:  { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  issueId:      { type: mongoose.Schema.Types.ObjectId, ref: 'StockIssue' },
  quantity:     { type: Number, required: true, min: 0.001 },
  unitCost:     { type: Number, default: 0 },
  totalCost:    { type: Number, default: 0 },
  consumedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  consumedAt:   { type: Date, default: Date.now },
  notes:        { type: String },
}, { timestamps: true });

patientConsumptionSchema.index({ hospitalId: 1, patientId: 1 });
patientConsumptionSchema.index({ hospitalId: 1, departmentId: 1, consumedAt: -1 });
patientConsumptionSchema.index({ hospitalId: 1, productId: 1, consumedAt: -1 });

module.exports = mongoose.model('PatientConsumption', patientConsumptionSchema);
