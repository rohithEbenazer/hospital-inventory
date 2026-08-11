const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'SUPER_ADMIN',
      'HOSPITAL_ADMIN',
      'INVENTORY_ADMIN',
      'STORE_MANAGER',
      'STORE_KEEPER',
      'PURCHASE_MANAGER',
      'PROCUREMENT_OFFICER',
      'PHARMACY_MANAGER',
      'PHARMACIST',
      'DEPARTMENT_MANAGER',
      'NURSE',
      'DOCTOR',
      'LAB_MANAGER',
      'OT_MANAGER',
      'BIOMEDICAL_ENGINEER',
      'ACCOUNTS_MANAGER',
      'AUDITOR',
      'REPORT_VIEWER'
    ],
    default: 'STORE_MANAGER'
  },
  department: { type: String, default: 'Central Inventory' },
  hospitalId: { type: String, default: 'HOSP-001' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
