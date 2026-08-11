const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  code: { type: String, required: true }, // e.g. CENTRAL-01-A-R03-S02
  zone: { type: String, default: 'A' },
  rack: { type: String, default: 'R01' },
  shelf: { type: String, default: 'S01' },
  bin: { type: String, default: 'B01' },
  description: { type: String }
});

const WarehouseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'CENTRAL_STORE', 'PHARMACY', 'ICU_STORE', 'OT_STORE',
      'WARD_STORE', 'LAB_STORE', 'RADIOLOGY_STORE', 'EMERGENCY_STORE',
      'MAINTENANCE_STORE', 'LINEN_STORE', 'HOUSEKEEPING_STORE', 'IT_STORE'
    ],
    default: 'CENTRAL_STORE'
  },
  department: { type: String, required: true },
  managerName: { type: String, default: 'Store Manager' },
  temperatureRange: { type: String, default: '20-25°C' },
  locations: [LocationSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
