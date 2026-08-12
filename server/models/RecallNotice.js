const mongoose = require('mongoose');

const RecallNoticeSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  recallNumber:     { type: String, required: true, unique: true },
  productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:      { type: String, required: true },
  batchIds:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  batchNumber:      { type: String, required: true },
  reason:           { type: String, required: true }, // e.g. Contamination alert, Regulatory directive
  source:           { type: String, enum: ['MANUFACTURER', 'REGULATORY_FDA_CDSCO', 'INTERNAL_QC'], default: 'MANUFACTURER' },
  severity:         { type: String, enum: ['CRITICAL', 'MAJOR', 'MINOR'], default: 'CRITICAL' },
  affectedQuantity: { type: Number, default: 0 },
  affectedLocations:[{ type: String }],
  quarantinedQty:   { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['INITIATED', 'STOCK_BLOCKED', 'PATIENTS_NOTIFIED', 'COMPLETED', 'DISPOSED'],
    default: 'INITIATED'
  },
  initiatedBy:      { type: String, required: true, default: 'Safety Officer' },
  closedBy:         { type: String }
}, { timestamps: true });

RecallNoticeSchema.index({ hospitalId: 1, recallNumber: 1 }, { unique: true });

module.exports = mongoose.model('RecallNotice', RecallNoticeSchema);
