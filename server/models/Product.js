const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  name: { type: String, required: true },
  genericName: { type: String },
  shortName: { type: String },
  description: { type: String },
  itemType: {
    type: String,
    enum: [
      'MEDICINE', 'CONSUMABLE', 'SURGICAL', 'LAB_REAGENT',
      'IMPLANT', 'EQUIPMENT', 'SPARE_PART', 'MEDICAL_GAS',
      'BLOOD_SUPPLY', 'LINEN', 'HOUSEKEEPING', 'DIETARY',
      'IT_ASSET', 'GENERAL'
    ],
    required: true
  },
  category: { type: String, required: true }, // Sub-category or hierarchy string
  brand: { type: String },
  manufacturer: { type: String },
  purchaseUnit: { type: String, default: 'Box' },
  issueUnit: { type: String, default: 'Piece' },
  conversionFactor: { type: Number, default: 1 }, // 1 Purchase Unit = X Issue Units
  hsnCode: { type: String },
  taxRate: { type: Number, default: 12 },
  trackingType: {
    type: String,
    enum: ['NONE', 'BATCH', 'LOT', 'SERIAL', 'BATCH_AND_EXPIRY', 'SERIAL_AND_WARRANTY'],
    default: 'BATCH_AND_EXPIRY'
  },
  requiresExpiry: { type: Boolean, default: true },
  requiresBatch: { type: Boolean, default: true },
  requiresSerial: { type: Boolean, default: false },
  minStock: { type: Number, default: 50 },
  maxStock: { type: Number, default: 1000 },
  reorderPoint: { type: Number, default: 100 },
  reorderQuantity: { type: Number, default: 300 },
  safetyStock: { type: Number, default: 30 },
  storageCondition: { type: String, default: 'Room Temp (20-25°C)' },
  controlledItem: { type: Boolean, default: false },
  criticalItem: { type: Boolean, default: false },
  unitCost: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  hospitalId: { type: String, default: 'HOSP-001' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
