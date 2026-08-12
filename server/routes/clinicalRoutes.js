const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const {
  BloodUnit, SterileTray, MedicalGasCylinder,
  CrashCart, WardParConfig, OTPreferenceCard,
  ImplantRecord, Invoice3WayMatch
} = require('../models/ClinicalModules');
const { authenticateToken } = require('../middleware/auth');
const { requireIdempotency } = require('../middleware/idempotencyMiddleware');

router.use(authenticateToken);

// Mock Seed Data if Database Collections Empty
const initMockClinicalData = async (hospitalId) => {
  const bloodCount = await BloodUnit.countDocuments({ hospitalId });
  if (bloodCount === 0) {
    await BloodUnit.create([
      { hospitalId, unitNumber: 'BU-2026-0041', bloodGroup: 'O+', componentType: 'PRBC', collectionDate: new Date(Date.now() - 5*86400000), expiryDate: new Date(Date.now() + 35*86400000), compatibilityStatus: 'COMPATIBLE', status: 'AVAILABLE' },
      { hospitalId, unitNumber: 'BU-2026-0042', bloodGroup: 'A+', componentType: 'FFP', collectionDate: new Date(Date.now() - 10*86400000), expiryDate: new Date(Date.now() + 180*86400000), compatibilityStatus: 'UNTESTED', status: 'QUARANTINE' },
    ]);
  }

  const sterileCount = await SterileTray.countDocuments({ hospitalId });
  if (sterileCount === 0) {
    await SterileTray.create([
      { hospitalId, trayBarcode: 'CSSD-SET-MAJOR-01', setName: 'Major Surgical Laparotomy Set', autoclaveCycleNo: 'CYC-2026-991', expiryDate: new Date(Date.now() + 14*86400000), biologicalIndicatorStatus: 'PASSED', status: 'STERILE_STORAGE' },
      { hospitalId, trayBarcode: 'CSSD-SET-ORTHO-02', setName: 'Ortho Knee Replacement Set', autoclaveCycleNo: 'CYC-2026-994', expiryDate: new Date(Date.now() + 14*86400000), biologicalIndicatorStatus: 'PASSED', status: 'ISSUED_OT' },
    ]);
  }

  const gasCount = await MedicalGasCylinder.countDocuments({ hospitalId });
  if (gasCount === 0) {
    await MedicalGasCylinder.create([
      { hospitalId, cylinderSerial: 'GAS-O2-MAN-01', gasType: 'OXYGEN', capacityLiters: 47, pressurePsi: 2000, location: 'OT Main Manifold', status: 'IN_USE' },
      { hospitalId, cylinderSerial: 'GAS-N2O-ICU-04', gasType: 'NITROUS_OXIDE', capacityLiters: 47, pressurePsi: 1800, location: 'ICU Reserve Store', status: 'FULL' },
    ]);
  }

  const cartCount = await CrashCart.countDocuments({ hospitalId });
  if (cartCount === 0) {
    await CrashCart.create([
      { hospitalId, cartNumber: 'CC-ICU-01', department: 'Intensive Care Unit', sealNumber: 'SEAL-994012', nextInspectionDate: new Date(Date.now() + 7*86400000), isSealed: true, replenishmentStatus: 'FULL' },
      { hospitalId, cartNumber: 'CC-EMERGENCY-02', department: 'Emergency Room', sealNumber: 'SEAL-994088', nextInspectionDate: new Date(Date.now() + 3*86400000), isSealed: true, replenishmentStatus: 'FULL' },
    ]);
  }

  const parCount = await WardParConfig.countDocuments({ hospitalId });
  if (parCount === 0) {
    await WardParConfig.create([
      { hospitalId, wardName: 'ICU Ward 3A', productName: 'IV Cannula 20G', productSku: 'CON-CAN-20G', parLevel: 100, minLevel: 30, currentStock: 25 },
      { hospitalId, wardName: 'Emergency Ward 1', productName: 'Normal Saline 500ml', productSku: 'CON-NS-500', parLevel: 200, minLevel: 50, currentStock: 40 },
    ]);
  }

  const matchCount = await Invoice3WayMatch.countDocuments({ hospitalId });
  if (matchCount === 0) {
    await Invoice3WayMatch.create([
      { hospitalId, poNumber: 'PO-2026-1042', grnNumber: 'GRN-2026-0859', invoiceNumber: 'INV-PHARM-991', poAmount: 45000, grnAmount: 45000, invoiceAmount: 45000, matchStatus: 'MATCHED', approvedForPayment: true },
      { hospitalId, poNumber: 'PO-2026-1088', grnNumber: 'GRN-2026-0910', invoiceNumber: 'INV-SUPP-442', poAmount: 120000, grnAmount: 120000, invoiceAmount: 128000, matchStatus: 'PRICE_MISMATCH', approvedForPayment: false },
    ]);
  }
};

// --- 1. STOCK RESERVATION ENGINE ---
router.get('/reservations', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const reservations = await Reservation.find({ hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reservations', requireIdempotency, async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const resData = { ...req.body, hospitalId, createdBy: req.user.fullName };
    const reservation = new Reservation(resData);
    await reservation.save();
    res.status(201).json({ success: true, message: 'Stock reserved successfully', data: reservation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- 2. BLOOD BANK MODULE ---
router.get('/blood-bank', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const units = await BloodUnit.find({ hospitalId }).sort({ expiryDate: 1 });
    res.json({ success: true, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/blood-bank/units', async (req, res) => {
  try {
    const unit = new BloodUnit({ ...req.body, hospitalId: req.user.hospitalId });
    await unit.save();
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- 3. CSSD STERILE SUPPLY ---
router.get('/cssd/trays', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const trays = await SterileTray.find({ hospitalId }).sort({ expiryDate: 1 });
    res.json({ success: true, data: trays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/cssd/autoclave', async (req, res) => {
  try {
    const tray = new SterileTray({ ...req.body, hospitalId: req.user.hospitalId });
    await tray.save();
    res.status(201).json({ success: true, data: tray });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- 4. MEDICAL GAS CYLINDERS ---
router.get('/medical-gas', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const cylinders = await MedicalGasCylinder.find({ hospitalId });
    res.json({ success: true, data: cylinders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 5. CRASH CART MANAGEMENT ---
router.get('/crash-carts', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const carts = await CrashCart.find({ hospitalId });
    res.json({ success: true, data: carts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/crash-carts/:id/inspect', async (req, res) => {
  try {
    const cart = await CrashCart.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: { sealNumber: req.body.sealNumber || 'SEAL-' + Date.now(), lastInspectionDate: new Date(), isSealed: true, replenishmentStatus: 'FULL' } },
      { new: true }
    );
    res.json({ success: true, message: 'Crash Cart inspected and resealed successfully', data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- 6. WARD PAR REPLENISHMENT ---
router.get('/ward-par', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const wardPars = await WardParConfig.find({ hospitalId });
    const shortages = wardPars.map(w => ({
      ...w.toObject(),
      shortageQty: Math.max(0, w.parLevel - w.currentStock),
      needsReplenishment: w.currentStock <= w.minLevel
    }));
    res.json({ success: true, data: shortages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 7. 3-WAY FINANCIAL INVOICE MATCHING ---
router.get('/invoice-matching', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    await initMockClinicalData(hospitalId);
    const matches = await Invoice3WayMatch.find({ hospitalId });
    res.json({ success: true, data: matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 8. FHIR / HL7 INTEROPERABILITY ADAPTERS ---
router.get(['/fhir/SupplyDelivery', '/SupplyDelivery'], (req, res) => {
  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 2,
    entry: [
      {
        resource: {
          resourceType: 'SupplyDelivery',
          id: 'supp-del-001',
          status: 'completed',
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/supply-item-type', code: 'medication' }] },
          suppliedItem: { itemCodeableConcept: { text: 'Amoxicillin 500mg' }, quantity: { value: 100, unit: 'Box' } },
          occurrenceDateTime: new Date().toISOString()
        }
      }
    ]
  });
});

router.get(['/fhir/MedicationDispense', '/MedicationDispense'], (req, res) => {
  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 1,
    entry: [
      {
        resource: {
          resourceType: 'MedicationDispense',
          id: 'med-disp-994',
          status: 'completed',
          medicationCodeableConcept: { text: 'Paracetamol 650mg' },
          subject: { display: 'Patient John Doe (ID: P-99201)' },
          whenHandedOver: new Date().toISOString()
        }
      }
    ]
  });
});

module.exports = router;
