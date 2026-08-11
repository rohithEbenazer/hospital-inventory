const mongoose = require('mongoose');

const TransferItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  transferQty: { type: Number, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date }
});

const StockTransferSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, default: 'HOSP-001' },
  transferNumber: { type: String, required: true, unique: true },
  fromWarehouse: { type: String, required: true }, // e.g. Central Store
  toWarehouse: { type: String, required: true },   // e.g. ICU Store
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  dispatchedBy: { type: String },
  receivedBy: { type: String },
  items: [TransferItemSchema],
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StockTransfer', StockTransferSchema);
