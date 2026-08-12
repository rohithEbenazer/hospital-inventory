const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  code:             { type: String, required: true },
  name:             { type: String, required: true },
  type: {
    type: String,
    enum: [
      'CENTRAL_STORE', 'PHARMACY', 'ICU_STORE', 'OT_STORE',
      'WARD_STORE', 'LAB_STORE', 'RADIOLOGY_STORE', 'EMERGENCY_STORE',
      'MAINTENANCE_STORE', 'LINEN_STORE', 'HOUSEKEEPING_STORE', 'IT_STORE'
    ],
    required: true,
    default: 'CENTRAL_STORE'
  },
  departmentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  department:       { type: String, default: 'Central Store' },
  address:          { type: String },
  managerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerName:      { type: String, default: 'Store Manager' },
  temperatureRange: { type: String, default: '20-25°C' },
  isActive:         { type: Boolean, default: true }
}, { timestamps: true });

WarehouseSchema.index({ hospitalId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
