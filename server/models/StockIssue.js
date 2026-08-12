const mongoose = require('mongoose');

const issueItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  quantity:     { type: Number, required: true, min: 1 },
  unitCost:     { type: Number, default: 0 },
  purpose:      { type: String },
}, { _id: false });

const stockIssueSchema = new mongoose.Schema({
  hospitalId:             { type: mongoose.Schema.Types.ObjectId, required: true },
  issueNumber:            { type: String, unique: true },
  indentId:               { type: mongoose.Schema.Types.ObjectId, ref: 'Indent' },
  sourceWarehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationDepartmentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  items:                  [issueItemSchema],
  purpose:                { type: String },
  patientId:              { type: String },       // optional patient linkage
  encounterId:            { type: String },
  procedureId:            { type: String },
  issuedBy:               { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivedBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:                 { type: String, enum: ['DRAFT','ISSUED','RECEIVED','CANCELLED'], default: 'DRAFT' },
  notes:                  { type: String },
}, { timestamps: true });

stockIssueSchema.pre('save', async function(next) {
  if (!this.issueNumber) {
    const count = await mongoose.model('StockIssue').countDocuments();
    this.issueNumber = `ISS-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

stockIssueSchema.index({ hospitalId: 1, destinationDepartmentId: 1 });
stockIssueSchema.index({ hospitalId: 1, sourceWarehouseId: 1 });

module.exports = mongoose.model('StockIssue', stockIssueSchema);
