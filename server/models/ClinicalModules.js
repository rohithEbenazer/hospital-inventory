const mongoose = require('mongoose');

// 1. Blood Bank Units
const bloodUnitSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  unitNumber:       { type: String, required: true, unique: true },
  bloodGroup:       { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  componentType:    { type: String, enum: ['WHOLE_BLOOD', 'PRBC', 'FFP', 'PLATELETS', 'CRYOPRECIPITATE'], required: true },
  collectionDate:   { type: Date, required: true },
  expiryDate:       { type: Date, required: true },
  storageLocation:  { type: String, default: 'Blood Bank Refrigerator #01' },
  compatibilityStatus: { type: String, enum: ['UNTESTED', 'COMPATIBLE', 'RESERVED', 'ISSUED', 'DISCARDED'], default: 'UNTESTED' },
  status:           { type: String, enum: ['QUARANTINE', 'AVAILABLE', 'RESERVED', 'ISSUED', 'EXPIRED'], default: 'QUARANTINE' },
}, { timestamps: true });

// 2. CSSD Sterile Trays
const sterileTraySchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  trayBarcode:      { type: String, required: true, unique: true },
  setName:          { type: String, required: true }, // Major Surgical Set, Laparoscopy Set
  autoclaveCycleNo: { type: String, required: true },
  sterilizationDate:{ type: Date, default: Date.now },
  expiryDate:       { type: Date, required: true },
  biologicalIndicatorStatus: { type: String, enum: ['PASSED', 'PENDING', 'FAILED'], default: 'PASSED' },
  status:           { type: String, enum: ['STERILE_STORAGE', 'ISSUED_OT', 'IN_USE', 'DIRTY_RETURN', 'DECONTAMINATION'], default: 'STERILE_STORAGE' },
}, { timestamps: true });

// 3. Medical Gas Cylinders
const medicalGasSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  cylinderSerial:   { type: String, required: true, unique: true },
  gasType:          { type: String, enum: ['OXYGEN', 'NITROUS_OXIDE', 'MEDICAL_AIR', 'CO2'], required: true },
  capacityLiters:   { type: Number, default: 47 },
  pressurePsi:      { type: Number, required: true },
  location:         { type: String, required: true }, // OT Manifold, ICU Bank
  status:           { type: String, enum: ['FULL', 'IN_USE', 'EMPTY', 'UNDER_REFILL'], default: 'FULL' },
}, { timestamps: true });

// 4. Crash Cart Checklist & Seals
const crashCartSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  cartNumber:       { type: String, required: true, unique: true },
  department:       { type: String, required: true },
  sealNumber:       { type: String, required: true },
  lastInspectionDate: { type: Date, default: Date.now },
  nextInspectionDate: { type: Date, required: true },
  isSealed:         { type: Boolean, default: true },
  replenishmentStatus: { type: String, enum: ['FULL', 'REPLENISHMENT_REQUIRED', 'IN_EMERGENCY_USE'], default: 'FULL' },
}, { timestamps: true });

// 5. Ward Par Levels
const wardParSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  wardName:         { type: String, required: true },
  productName:      { type: String, required: true },
  productSku:       { type: String, required: true },
  parLevel:         { type: Number, required: true },
  minLevel:         { type: Number, required: true },
  currentStock:     { type: Number, required: true },
}, { timestamps: true });

// 6. OT Preference Cards
const otPreferenceCardSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  surgeonName:      { type: String, required: true },
  procedureName:    { type: String, required: true },
  requiredItems:    [{ productName: String, productSku: String, qty: Number }],
}, { timestamps: true });

// 7. Implant UDI Traceability
const implantRecordSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  udiBarcode:       { type: String, required: true },
  gtin:             { type: String, required: true },
  serialNumber:     { type: String, required: true },
  lotNumber:        { type: String, required: true },
  implantName:      { type: String, required: true },
  patientId:        { type: String, required: true },
  surgeonName:      { type: String, required: true },
  procedureDate:    { type: Date, default: Date.now },
  status:           { type: String, enum: ['IMPLANTED', 'REMOVED', 'EXPLANTED'], default: 'IMPLANTED' },
}, { timestamps: true });

// 8. 3-Way Financial Invoice Matching
const invoice3WayMatchSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  poNumber:         { type: String, required: true },
  grnNumber:        { type: String, required: true },
  invoiceNumber:    { type: String, required: true },
  poAmount:         { type: Number, required: true },
  grnAmount:        { type: Number, required: true },
  invoiceAmount:    { type: Number, required: true },
  matchStatus:      { type: String, enum: ['MATCHED', 'PRICE_MISMATCH', 'QTY_MISMATCH', 'PENDING_APPROVAL'], default: 'MATCHED' },
  approvedForPayment: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  BloodUnit: mongoose.model('BloodUnit', bloodUnitSchema),
  SterileTray: mongoose.model('SterileTray', sterileTraySchema),
  MedicalGasCylinder: mongoose.model('MedicalGasCylinder', medicalGasSchema),
  CrashCart: mongoose.model('CrashCart', crashCartSchema),
  WardParConfig: mongoose.model('WardParConfig', wardParSchema),
  OTPreferenceCard: mongoose.model('OTPreferenceCard', otPreferenceCardSchema),
  ImplantRecord: mongoose.model('ImplantRecord', implantRecordSchema),
  Invoice3WayMatch: mongoose.model('Invoice3WayMatch', invoice3WayMatchSchema),
};
