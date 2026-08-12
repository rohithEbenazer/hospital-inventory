const mongoose = require('mongoose');

const SerialNumberSchema = new mongoose.Schema({
  hospitalId:           { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  productId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:          { type: String, required: true },
  serialNumber:         { type: String, required: true },
  batchId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: {
    type: String,
    enum: [
      'AVAILABLE', 'ASSIGNED', 'IN_USE', 'UNDER_REPAIR',
      'UNDER_CALIBRATION', 'LOST', 'DAMAGED', 'DISPOSED'
    ],
    default: 'AVAILABLE'
  },
  warehouseId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName:        { type: String, default: 'Biomedical / Central Store' },
  locationId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  assignedDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedDepartment:   { type: String },
  assignedUserId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedUser:         { type: String },
  patientId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  purchaseOrderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  warrantyStart:        { type: Date },
  warrantyEnd:          { type: Date },
  amcStart:             { type: Date },
  amcEnd:               { type: Date },
  lastServiceDate:      { type: Date },
  nextServiceDate:      { type: Date }
}, { timestamps: true });

// Section 17 Compound Unique Index per hospital
SerialNumberSchema.index({ hospitalId: 1, serialNumber: 1 }, { unique: true });
SerialNumberSchema.index({ hospitalId: 1, productId: 1, status: 1 });

module.exports = mongoose.model('SerialNumber', SerialNumberSchema);
