const mongoose = require('mongoose');

// 1. Blood Bank Units
const bloodUnitSchema = new mongoose.Schema({
  hospitalId:          { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  unitNumber:          { type: String, required: true, unique: true },
  bloodGroup:          { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  componentType:       { type: String, enum: ['WHOLE_BLOOD', 'PRBC', 'FFP', 'PLATELETS', 'CRYOPRECIPITATE'], required: true },
  collectionDate:      { type: Date, required: true },
  expiryDate:          { type: Date, required: true },
  storageLocation:     { type: String, default: 'Blood Bank Refrigerator #01' },
  compatibilityStatus: { type: String, enum: ['UNTESTED', 'COMPATIBLE', 'RESERVED', 'ISSUED', 'DISCARDED'], default: 'UNTESTED' },
  status:              { type: String, enum: ['QUARANTINE', 'AVAILABLE', 'RESERVED', 'ISSUED', 'EXPIRED'], default: 'QUARANTINE' },
}, { timestamps: true });

// 2. CSSD Sterile Trays
const sterileTraySchema = new mongoose.Schema({
  hospitalId:                { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  trayBarcode:               { type: String, required: true, unique: true },
  setName:                   { type: String, required: true }, // Major Surgical Set, Laparoscopy Set
  autoclaveCycleNo:          { type: String, required: true },
  sterilizationDate:         { type: Date, default: Date.now },
  expiryDate:                { type: Date, required: true },
  biologicalIndicatorStatus: { type: String, enum: ['PASSED', 'PENDING', 'FAILED'], default: 'PASSED' },
  status:                    { type: String, enum: ['STERILE_STORAGE', 'ISSUED_OT', 'IN_USE', 'DIRTY_RETURN', 'DECONTAMINATION'], default: 'STERILE_STORAGE' },
}, { timestamps: true });

// 3. Section 37 Medical Gas Cylinders
const medicalGasSchema = new mongoose.Schema({
  hospitalId:         { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  cylinderSerial:     { type: String, required: true, unique: true },
  gasType:            { type: String, enum: ['OXYGEN', 'NITROUS_OXIDE', 'MEDICAL_AIR', 'CO2'], required: true },
  capacityLiters:     { type: Number, default: 47 },
  pressurePsi:        { type: Number, required: true },
  supplier:           { type: String, default: 'BOC Healthcare Gases' },
  location:           { type: String, required: true }, // OT Manifold, ICU Bank
  lastRefillDate:     { type: Date, default: Date.now },
  nextInspectionDate: { type: Date },
  status:             { type: String, enum: ['FULL', 'PARTIAL', 'EMPTY', 'IN_USE', 'UNDER_INSPECTION', 'DAMAGED'], default: 'FULL' },
}, { timestamps: true });

// 4. Crash Cart Checklist & Seals
const crashCartSchema = new mongoose.Schema({
  hospitalId:          { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  cartNumber:          { type: String, required: true, unique: true },
  department:          { type: String, required: true },
  sealNumber:          { type: String, required: true },
  lastInspectionDate:  { type: Date, default: Date.now },
  nextInspectionDate:  { type: Date, required: true },
  isSealed:            { type: Boolean, default: true },
  replenishmentStatus: { type: String, enum: ['FULL', 'REPLENISHMENT_REQUIRED', 'IN_EMERGENCY_USE'], default: 'FULL' },
}, { timestamps: true });

// 5. Ward Par Levels
const wardParSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  wardName:     { type: String, required: true },
  productName:  { type: String, required: true },
  productSku:   { type: String, required: true },
  parLevel:     { type: Number, required: true },
  minLevel:     { type: Number, required: true },
  currentStock: { type: Number, required: true },
}, { timestamps: true });

module.exports = {
  BloodUnit: mongoose.model('BloodUnit', bloodUnitSchema),
  SterileTray: mongoose.model('SterileTray', sterileTraySchema),
  MedicalGas: mongoose.model('MedicalGas', medicalGasSchema),
  CrashCart: mongoose.model('CrashCart', crashCartSchema),
  WardPar: mongoose.model('WardPar', wardParSchema)
};
