const mongoose = require('mongoose');

const calibrationRecordSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalAsset', required: true },
  calibratedBy: { type: String, required: true }, // technician name / vendor
  calibrationDate: { type: Date, required: true },
  nextCalibrationDue: { type: Date, required: true },
  result: { type: String, enum: ['PASS', 'FAIL', 'CONDITIONAL'], required: true },
  certificateUrl: { type: String },
  referenceStandard: { type: String },
  notes: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

calibrationRecordSchema.index({ hospitalId: 1, assetId: 1, calibrationDate: -1 });

module.exports = mongoose.model('CalibrationRecord', calibrationRecordSchema);
