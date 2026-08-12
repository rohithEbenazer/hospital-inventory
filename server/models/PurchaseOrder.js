const mongoose = require('mongoose');

const POItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku:  { type: String, required: true },
  productName: { type: String, required: true },
  orderedQty:  { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  unitCost:    { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  taxRate:     { type: Number, default: 12 },
  totalCost:   { type: Number, required: true }
}, { _id: false });

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber:            { type: String, required: true, unique: true },
  hospitalId:          { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  supplierId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName:        { type: String, required: true },
  warehouseId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  requestedBy:         { type: String, required: true },
  approvedBy:          { type: String },
  approvedAt:          { type: Date },
  createdBy:           { type: String, default: 'Procurement Officer' },
  orderDate:           { type: Date, default: Date.now },
  expectedDeliveryDate:{ type: Date },
  items:               [POItemSchema],
  subtotal:            { type: Number, required: true },
  discount:            { type: Number, default: 0 },
  taxAmount:           { type: Number, required: true },
  shipping:            { type: Number, default: 0 },
  grandTotal:          { type: Number, required: true },
  currency:            { type: String, default: 'INR' },
  paymentTerms:        { type: String, default: 'Net 30 Days' },
  deliveryTerms:       { type: String, default: 'FOB Hospital Central Store' },
  status: {
    type: String,
    enum: [
      'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT',
      'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'
    ],
    default: 'PENDING_APPROVAL'
  },
  grnNumber:           { type: String },
  qcStatus:            { type: String, enum: ['PENDING', 'PASSED', 'FAILED'], default: 'PENDING' },
  notes:               { type: String }
}, { timestamps: true });

PurchaseOrderSchema.index({ hospitalId: 1, poNumber: 1 }, { unique: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
