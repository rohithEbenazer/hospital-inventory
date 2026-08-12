const mongoose = require('mongoose');

const StockCountItemSchema = new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:   { type: String, required: true },
  batchNumber:   { type: String },
  locationCode:  { type: String },
  systemQty:     { type: Number, required: true },
  physicalQty:   { type: Number, required: true },
  varianceQty:   { type: Number, required: true }, // physicalQty - systemQty
  varianceValue: { type: Number, default: 0 },
  reason:        { type: String }
}, { _id: false });

const StockCountSchema = new mongoose.Schema({
  hospitalId:     { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  countNumber:    { type: String, required: true, unique: true },
  warehouseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName:  { type: String, required: true },
  countType: {
    type: String,
    enum: ['FULL_COUNT', 'CYCLE_COUNT', 'RANDOM_COUNT', 'CATEGORY_COUNT', 'LOCATION_COUNT'],
    default: 'CYCLE_COUNT'
  },
  scopeFrozen:    { type: Boolean, default: true },
  countDate:      { type: Date, default: Date.now },
  conductedBy:    { type: String, required: true },
  approvedBy:     { type: String },
  items:          [StockCountItemSchema],
  totalSystemQty: { type: Number, default: 0 },
  totalPhysicalQty:{ type: Number, default: 0 },
  totalVarianceQty:{ type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'CREATED', 'FROZEN', 'IN_PROGRESS', 'SUBMITTED',
      'VARIANCE_REVIEW', 'APPROVED_AND_POSTED', 'REJECTED', 'CLOSED'
    ],
    default: 'IN_PROGRESS'
  }
}, { timestamps: true });

StockCountSchema.index({ hospitalId: 1, countNumber: 1 }, { unique: true });

module.exports = mongoose.model('StockCount', StockCountSchema);
