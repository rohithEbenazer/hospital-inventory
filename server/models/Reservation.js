const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  hospitalId:        { type: mongoose.Schema.Types.Mixed, required: true },
  reservationNumber: { type: String, unique: true },
  productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  batchId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  quantity:          { type: Number, required: true },
  sourceType:        { type: String, enum: ['SURGERY', 'WARD_REPLENISHMENT', 'CRASH_CART', 'PHARMACY_DISPENSE', 'INDENT'], required: true },
  sourceId:          { type: String },
  status:            { type: String, enum: ['RESERVED', 'ALLOCATED', 'COMMITTED', 'CANCELLED', 'EXPIRED'], default: 'RESERVED' },
  expiresAt:         { type: Date },
  createdBy:         { type: String },
}, { timestamps: true });

reservationSchema.pre('save', async function(next) {
  if (!this.reservationNumber) {
    this.reservationNumber = 'RES-2026-' + Math.floor(100000 + Math.random() * 900000);
  }
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hr default hold
  }
  next();
});

reservationSchema.index({ hospitalId: 1, productId: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
