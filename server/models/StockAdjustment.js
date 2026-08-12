const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  adjustmentNumber: { type: String, unique: true },
  productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  warehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  locationId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  currentQty:       { type: Number, required: true },
  actualQty:        { type: Number, required: true },
  variance:         { type: Number }, // actualQty - currentQty
  reason:           { type: String, enum: ['COUNT_VARIANCE','DAMAGE','LOSS','DATA_ERROR','THEFT','EXPIRY','OTHER'], required: true },
  evidence:         { type: String }, // URL or description
  notes:            { type: String },
  status:           { type: String, enum: ['DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','POSTED'], default: 'DRAFT' },
  requestedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:       { type: Date },
  postedAt:         { type: Date },
}, { timestamps: true });

adjustmentSchema.pre('save', async function(next) {
  if (!this.adjustmentNumber) {
    const count = await mongoose.model('StockAdjustment').countDocuments();
    this.adjustmentNumber = `ADJ-${String(count + 1).padStart(5, '0')}`;
  }
  if (this.actualQty !== undefined && this.currentQty !== undefined) {
    this.variance = this.actualQty - this.currentQty;
  }
  next();
});

adjustmentSchema.index({ hospitalId: 1, productId: 1 });
adjustmentSchema.index({ hospitalId: 1, warehouseId: 1 });

module.exports = mongoose.model('StockAdjustment', adjustmentSchema);
