const mongoose = require('mongoose');

const RecallNoticeSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  recallNumber: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchNumber: { type: String, required: true },
  reason: { type: String, required: true }, // e.g. Contamination alert, Regulatory directive
  issuedBy: { type: String, required: true },
  quarantinedQty: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['ACTIVE_RECALL', 'COMPLETED', 'DISPOSED'],
    default: 'ACTIVE_RECALL'
  }
}, { timestamps: true });

module.exports = mongoose.model('RecallNotice', RecallNoticeSchema);
