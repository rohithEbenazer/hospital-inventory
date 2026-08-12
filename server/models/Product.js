const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  hospitalId:         { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  sku:                { type: String, required: true },
  barcode:            { type: String },
  name:               { type: String, required: true },
  genericName:        { type: String },
  shortName:          { type: String },
  description:        { type: String },
  itemType: {
    type: String,
    enum: [
      'MEDICINE', 'DRUG', 'CONSUMABLE', 'SURGICAL', 'LAB_REAGENT',
      'IMPLANT', 'EQUIPMENT', 'SPARE_PART', 'MEDICAL_GAS',
      'BLOOD_SUPPLY', 'LINEN', 'HOUSEKEEPING', 'DIETARY',
      'IT_ASSET', 'GENERAL'
    ],
    required: true,
    default: 'MEDICINE'
  },
  categoryId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brandId:            { type: String },
  manufacturerId:     { type: String },
  category:           { type: String, default: 'General Medical Supplies' },
  brand:              { type: String },
  manufacturer:       { type: String },
  unitId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  packSize:           { type: Number, default: 1 },
  purchaseUnit:       { type: String, default: 'Box' },
  issueUnit:          { type: String, default: 'Piece' },
  conversionFactor:   { type: Number, default: 1, min: 0.0001 },
  hsnCode:            { type: String, default: '3004' },
  taxCode:            { type: String, default: 'GST_12' },
  taxRate:            { type: Number, default: 12 },
  trackingType: {
    type: String,
    enum: ['NONE', 'BATCH', 'LOT', 'SERIAL', 'BATCH_AND_EXPIRY', 'SERIAL_AND_WARRANTY'],
    default: 'BATCH_AND_EXPIRY'
  },
  requiresExpiry:     { type: Boolean, default: true },
  requiresBatch:      { type: Boolean, default: true },
  requiresSerial:     { type: Boolean, default: false },
  requiresTemperature:{ type: Boolean, default: false },
  minStock:           { type: Number, default: 50 },
  maxStock:           { type: Number, default: 1000 },
  reorderPoint:       { type: Number, default: 100 },
  reorderQuantity:    { type: Number, default: 300 },
  safetyStock:        { type: Number, default: 30 },
  leadTimeDays:       { type: Number, default: 3 },
  storageCondition:   { type: String, default: 'Room Temp (20-25°C)' },
  controlledItem:     { type: Boolean, default: false },
  criticalItem:       { type: Boolean, default: false },
  unitCost:           { type: Number, default: 0 },
  mrp:                { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Section 9.2 Rule 1: Compound Unique Index for SKU per hospital
ProductSchema.index({ hospitalId: 1, sku: 1 }, { unique: true });

// Section 9.2 Rule 2: Compound Sparse Unique Index for Barcode per hospital
ProductSchema.index({ hospitalId: 1, barcode: 1 }, { unique: true, sparse: true });

// Pre-save validator for Unit Conversion & Medicine Batch/Expiry Enforcement
ProductSchema.pre('save', function (next) {
  if (this.purchaseUnit !== this.issueUnit && (!this.conversionFactor || this.conversionFactor <= 0)) {
    return next(new Error('Unit conversionFactor must be greater than 0 when purchaseUnit differs from issueUnit.'));
  }
  if (['MEDICINE', 'DRUG'].includes(this.itemType)) {
    this.requiresBatch = true;
    this.requiresExpiry = true;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
