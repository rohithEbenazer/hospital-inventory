const mongoose = require('mongoose');

// 1. Lab Reagents & Consumables
const labReagentSchema = new mongoose.Schema({
  hospitalId:        { type: mongoose.Schema.Types.Mixed, required: true },
  reagentName:       { type: String, required: true },
  lotNumber:         { type: String, required: true },
  analyzerCompatibility: { type: String, required: true }, // e.g. Roche Cobas 6000
  expiryDate:        { type: Date, required: true },
  currentStockUnits: { type: Number, required: true },
  calibrationStatus: { type: String, enum: ['CALIBRATED', 'PENDING_CALIBRATION', 'EXPIRED'], default: 'CALIBRATED' },
  status:            { type: String, enum: ['AVAILABLE', 'QUARANTINE', 'EXPIRED'], default: 'AVAILABLE' }
}, { timestamps: true });

// 2. Facility Stores & Maintenance
const facilityStoreSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  category:         { type: String, enum: ['HOUSEKEEPING', 'LINEN', 'MAINTENANCE', 'PLUMBING', 'ELECTRICAL'], required: true },
  itemName:         { type: String, required: true },
  itemSku:          { type: String, required: true },
  currentQuantity:  { type: Number, required: true },
  reorderLevel:     { type: Number, required: true },
  unitCost:         { type: Number, required: true }
}, { timestamps: true });

// 3. Patient Encounter Billing Integration
const patientBillingSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  patientId:        { type: String, required: true },
  encounterId:      { type: String, required: true },
  procedureName:    { type: String, required: true },
  consumedItems:    [{ productName: String, batchNumber: String, quantity: Number, unitCost: Number, totalCost: Number }],
  totalBillAmount:  { type: Number, required: true },
  billingStatus:    { type: String, enum: ['DRAFT', 'BILLED', 'PAID', 'CANCELLED'], default: 'DRAFT' }
}, { timestamps: true });

// 4. Insurance / TPA Pre-Authorization Claims
const insuranceClaimSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  claimNumber:      { type: String, required: true, unique: true },
  patientId:        { type: String, required: true },
  tpaName:          { type: String, required: true }, // Star Health, Max Bupa, etc.
  approvedAmount:   { type: Number, required: true },
  claimedConsumablesCost: { type: Number, required: true },
  claimStatus:      { type: String, enum: ['SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'], default: 'SUBMITTED' }
}, { timestamps: true });

// 5. Supplier B2B Invoices
const supplierInvoiceSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  invoiceNumber:    { type: String, required: true, unique: true },
  supplierName:     { type: String, required: true },
  poNumber:         { type: String, required: true },
  grnNumber:        { type: String, required: true },
  subtotal:         { type: Number, required: true },
  gstTax:           { type: Number, required: true },
  grandTotal:       { type: Number, required: true },
  paymentTerms:     { type: String, default: 'NET_30' },
  dueDate:          { type: Date, required: true },
  paymentStatus:    { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' }
}, { timestamps: true });

// 6. Supplier Performance Scoring
const supplierRatingSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  supplierName:     { type: String, required: true },
  deliveryScore:    { type: Number, default: 95 }, // Out of 100
  qualityScore:     { type: Number, default: 98 },
  lateDeliveryRate: { type: Number, default: 2.5 }, // %
  rejectedQtyPct:   { type: Number, default: 0.5 },
  overallRating:    { type: String, enum: ['PREFERRED', 'STANDARD', 'UNDER_REVIEW', 'BLOCKED'], default: 'PREFERRED' }
}, { timestamps: true });

// 7. Mobile Scanner Offline Queue
const offlineSyncQueueSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true },
  idempotencyKey:   { type: String, required: true, unique: true },
  deviceSerial:     { type: String, required: true },
  actionType:       { type: String, enum: ['BARCODE_SCAN', 'GRN_RECEIPT', 'STOCK_ISSUE', 'PHYSICAL_COUNT'], required: true },
  payload:          { type: mongoose.Schema.Types.Mixed, required: true },
  syncStatus:       { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = {
  LabReagent: mongoose.model('LabReagent', labReagentSchema),
  FacilityStore: mongoose.model('FacilityStore', facilityStoreSchema),
  PatientBilling: mongoose.model('PatientBilling', patientBillingSchema),
  InsuranceClaim: mongoose.model('InsuranceClaim', insuranceClaimSchema),
  SupplierInvoice: mongoose.model('SupplierInvoice', supplierInvoiceSchema),
  SupplierRating: mongoose.model('SupplierRating', supplierRatingSchema),
  OfflineSyncQueue: mongoose.model('OfflineSyncQueue', offlineSyncQueueSchema)
};
