const mongoose = require('mongoose');

const StockCountItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  batchNumber: { type: String },
  systemQty: { type: Number, required: true },
  physicalQty: { type: Number, required: true },
  varianceQty: { type: Number, required: true }, // physicalQty - systemQty
  varianceValue: { type: Number, default: 0 },
  reason: { type: String }
});

const StockCountSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  countNumber: { type: String, required: true, unique: true },
  warehouseName: { type: String, required: true },
  countDate: { type: Date, default: Date.now },
  conductedBy: { type: String, required: true },
  approvedBy: { type: String },
  items: [StockCountItemSchema],
  totalSystemQty: { type: Number, default: 0 },
  totalPhysicalQty: { type: Number, default: 0 },
  totalVarianceQty: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'SUBMITTED', 'APPROVED_AND_POSTED', 'REJECTED'],
    default: 'IN_PROGRESS'
  }
}, { timestamps: true });

module.exports = mongoose.model('StockCount', StockCountSchema);
