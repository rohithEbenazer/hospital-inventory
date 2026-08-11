const mongoose = require('mongoose');

const SerialNumberSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'IN_USE', 'UNDER_REPAIR', 'UNDER_CALIBRATION', 'LOST', 'DAMAGED', 'DISPOSED'],
    default: 'AVAILABLE'
  },
  warehouseName: { type: String, default: 'Biomedical / Central Store' },
  assignedDepartment: { type: String },
  assignedUser: { type: String },
  warrantyStart: { type: Date },
  warrantyEnd: { type: Date },
  amcStart: { type: Date },
  amcEnd: { type: Date },
  lastServiceDate: { type: Date },
  nextServiceDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SerialNumber', SerialNumberSchema);
