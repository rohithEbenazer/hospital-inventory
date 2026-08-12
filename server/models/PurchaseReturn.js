const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  quantity:     { type: Number, required: true, min: 1 },
  unitPrice:    { type: Number },
  reason:       { type: String, enum: ['DAMAGED','EXCESS','WRONG_ITEM','NEAR_EXPIRY','EXPIRED','RECALL','QUALITY_ISSUE','OTHER'], required: true },
}, { _id: false });

const purchaseReturnSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  returnNumber:     { type: String, unique: true },
  poId:             { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  grnId:            { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  supplierId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:            [returnItemSchema],
  creditNoteNumber: { type: String },
  totalValue:       { type: Number, default: 0 },
  status:           { type: String, enum: ['DRAFT','SUBMITTED','SUPPLIER_CONFIRMED','INVENTORY_DEDUCTED','CREDIT_RECEIVED','CANCELLED'], default: 'DRAFT' },
  notes:            { type: String },
  initiatedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber) {
    const count = await mongoose.model('PurchaseReturn').countDocuments();
    this.returnNumber = `PR-RET-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseReturn', purchaseReturnSchema);
