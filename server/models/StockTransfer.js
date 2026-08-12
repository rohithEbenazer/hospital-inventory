const mongoose = require('mongoose');

const TransferItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:  { type: String, required: true },
  productName: { type: String, required: true },
  transferQty: { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  batchNumber: { type: String, required: true },
  expiryDate:  { type: Date }
}, { _id: false });

const StockTransferSchema = new mongoose.Schema({
  hospitalId:     { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  transferNumber: { type: String, required: true, unique: true },
  fromWarehouse:  { type: String, required: true }, // e.g. Central Main Warehouse
  toWarehouse:    { type: String, required: true },   // e.g. ICU Store
  fromWarehouseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  requestedBy:    { type: String, required: true },
  approvedBy:     { type: String },
  pickedBy:       { type: String },
  dispatchedBy:   { type: String },
  receivedBy:     { type: String },
  items:          [TransferItemSchema],
  status: {
    type: String,
    enum: [
      'DRAFT', 'REQUESTED', 'APPROVED', 'PICKED',
      'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'REJECTED', 'CANCELLED'
    ],
    default: 'REQUESTED'
  },
  remarks:        { type: String }
}, { timestamps: true });

StockTransferSchema.index({ hospitalId: 1, transferNumber: 1 }, { unique: true });

module.exports = mongoose.model('StockTransfer', StockTransferSchema);
