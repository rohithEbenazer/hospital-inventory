const mongoose = require('mongoose');

const POItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  orderedQty: { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  unitCost: { type: Number, required: true },
  taxRate: { type: Number, default: 12 },
  totalCost: { type: Number, required: true }
});

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  orderDate: { type: Date, default: Date.now },
  expectedDeliveryDate: { type: Date },
  items: [POItemSchema],
  subTotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    default: 'SUBMITTED'
  },
  grnNumber: { type: String },
  qcStatus: { type: String, enum: ['PENDING', 'PASSED', 'FAILED'], default: 'PENDING' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
