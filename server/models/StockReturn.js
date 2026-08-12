const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  quantity:     { type: Number, required: true, min: 1 },
  reason:       { type: String, enum: ['DAMAGED','EXCESS','WRONG_ITEM','NEAR_EXPIRY','EXPIRED','RECALL','QUALITY_ISSUE','OTHER'], required: true },
  condition:    { type: String, enum: ['USABLE','DAMAGED','DESTROYED'], default: 'USABLE' },
}, { _id: false });

const stockReturnSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  returnNumber:     { type: String, unique: true },
  type:             { type: String, enum: ['DEPARTMENT_RETURN','SUPPLIER_RETURN'], required: true },
  departmentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  supplierId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  warehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  originalIssueId:  { type: mongoose.Schema.Types.ObjectId, ref: 'StockIssue' },
  items:            [returnItemSchema],
  status:           { type: String, enum: ['DRAFT','SUBMITTED','INSPECTED','ACCEPTED','REJECTED','POSTED'], default: 'DRAFT' },
  inspectedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:            { type: String },
}, { timestamps: true });

stockReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber) {
    const count = await mongoose.model('StockReturn').countDocuments();
    this.returnNumber = `RET-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('StockReturn', stockReturnSchema);
