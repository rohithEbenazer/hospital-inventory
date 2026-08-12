const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Mock in-memory store for 300-series operational runtime state
let registeredDevices = [
  { _id: 'dev-001', deviceId: 'SCAN-ICU-01', deviceType: 'BARCODE_SCANNER', assignedUser: 'Nurse Sarah', department: 'ICU', status: 'ACTIVE', osVersion: 'Android 14', appVersion: 'v2.4.1', lastSeen: new Date() },
  { _id: 'dev-002', deviceId: 'MOB-STORE-02', deviceType: 'MOBILE_TERMINAL', assignedUser: 'Storekeeper John', department: 'Central Store', status: 'ACTIVE', osVersion: 'iOS 17.4', appVersion: 'v2.4.1', lastSeen: new Date() },
  { _id: 'dev-003', deviceId: 'SCAN-OT-03', deviceType: 'BARCODE_SCANNER', assignedUser: 'OT Manager Michael', department: 'Surgical OT', status: 'LOST', osVersion: 'Android 13', appVersion: 'v2.2.0', lastSeen: new Date(Date.now() - 86400000 * 3) },
];

let printAuditLog = [
  { _id: 'prt-001', labelType: 'BIN_LABEL', entityCode: 'BIN-CENTRAL-A01', requestedBy: 'John Doe', reason: 'Initial Bin Setup', isReprint: false, timestamp: new Date(Date.now() - 3600000 * 5), qty: 1 },
  { _id: 'prt-002', labelType: 'BATCH_LABEL', entityCode: 'BAT-AMO-9942', requestedBy: 'Sarah Jenkins', reason: 'Damaged original sticker', isReprint: true, timestamp: new Date(Date.now() - 3600000 * 2), qty: 5 },
];

let periodLocks = [
  { _id: 'pl-2025', fiscalYear: '2024-25', periodName: 'Q4 2024-25', startDate: '2025-01-01', endDate: '2025-03-31', isLocked: true, lockedBy: 'Hospital Admin', lockedAt: '2025-04-01' },
  { _id: 'pl-2026', fiscalYear: '2025-26', periodName: 'Q1 2025-26', startDate: '2025-04-01', endDate: '2025-06-30', isLocked: true, lockedBy: 'Hospital Admin', lockedAt: '2025-07-01' },
  { _id: 'pl-2026-q2', fiscalYear: '2025-26', periodName: 'Current Active (Q2 2025-26)', startDate: '2025-07-01', endDate: '2025-09-30', isLocked: false, lockedBy: null, lockedAt: null },
];

let documentSequences = [
  { module: 'Purchase Order', prefix: 'PO-2026-', currentNumber: 1042, nextSample: 'PO-2026-001043' },
  { module: 'Goods Receipt (GRN)', prefix: 'GRN-2026-', currentNumber: 859, nextSample: 'GRN-2026-000860' },
  { module: 'Department Indent', prefix: 'IND-2026-', currentNumber: 3410, nextSample: 'IND-2026-003411' },
  { module: 'Stock Transfer', prefix: 'TRF-2026-', currentNumber: 198, nextSample: 'TRF-2026-000199' },
  { module: 'Stock Adjustment', prefix: 'ADJ-2026-', currentNumber: 74, nextSample: 'ADJ-2026-000075' },
];

// --- 1. DEVICE MANAGEMENT (Section 299) ---
router.get('/devices', authenticate, (req, res) => {
  res.json({ success: true, data: registeredDevices });
});

router.post('/devices', authenticate, (req, res) => {
  const newDev = {
    _id: 'dev-' + Date.now(),
    deviceId: req.body.deviceId || 'DEV-' + Math.floor(100 + Math.random() * 900),
    deviceType: req.body.deviceType || 'BARCODE_SCANNER',
    assignedUser: req.body.assignedUser || req.user.fullName,
    department: req.body.department || 'Central Store',
    status: 'ACTIVE',
    osVersion: req.body.osVersion || 'Android 14',
    appVersion: 'v2.4.1',
    lastSeen: new Date()
  };
  registeredDevices.unshift(newDev);
  res.status(201).json({ success: true, message: 'Device registered successfully', data: newDev });
});

router.patch('/devices/:id/status', authenticate, (req, res) => {
  const dev = registeredDevices.find(d => d._id === req.params.id);
  if (!dev) return res.status(404).json({ success: false, message: 'Device not found' });
  dev.status = req.body.status || dev.status;
  res.json({ success: true, message: `Device status updated to ${dev.status}`, data: dev });
});

// --- 2. PRINTER & REPRINT LOG ENGINE (Sections 300-302) ---
router.get('/labels/print-log', authenticate, (req, res) => {
  res.json({ success: true, data: printAuditLog });
});

router.post('/labels/print-log', authenticate, (req, res) => {
  const newLog = {
    _id: 'prt-' + Date.now(),
    labelType: req.body.labelType || 'PRODUCT_LABEL',
    entityCode: req.body.entityCode || 'SKU-GENERIC',
    requestedBy: req.user.fullName || 'Authorized User',
    reason: req.body.reason || 'Operational Requirement',
    isReprint: Boolean(req.body.isReprint),
    timestamp: new Date(),
    qty: req.body.qty || 1
  };
  printAuditLog.unshift(newLog);
  res.status(201).json({ success: true, message: 'Print audit logged cleanly', data: newLog });
});

// --- 3. PERIOD LOCK & SEQUENCES (Sections 305-316) ---
router.get('/period-locks', authenticate, (req, res) => {
  res.json({ success: true, data: periodLocks });
});

router.post('/period-locks/toggle', authenticate, (req, res) => {
  const lock = periodLocks.find(p => p._id === req.body.periodId);
  if (!lock) return res.status(404).json({ success: false, message: 'Period lock not found' });
  lock.isLocked = !lock.isLocked;
  lock.lockedBy = lock.isLocked ? req.user.fullName : null;
  lock.lockedAt = lock.isLocked ? new Date() : null;
  res.json({ success: true, message: `Fiscal period ${lock.periodName} is now ${lock.isLocked ? 'LOCKED' : 'OPEN'}`, data: lock });
});

router.get('/sequences', authenticate, (req, res) => {
  res.json({ success: true, data: documentSequences });
});

// --- 4. RECONCILIATION & LANDED COST (Sections 279-280, 313) ---
router.get('/reconciliation', authenticate, (req, res) => {
  const reconData = [
    { module: 'Pharmacy Dispense vs Ledger', status: 'MATCHED', inventoryVal: 1420500, secondaryVal: 1420500, variance: 0, lastCheck: new Date() },
    { module: 'Goods Receipt GRN vs PO Invoice', status: 'MATCHED', inventoryVal: 3890000, secondaryVal: 3890000, variance: 0, lastCheck: new Date() },
    { module: 'Patient Billing vs Issue Records', status: 'MISMATCH_ALERT', inventoryVal: 840200, secondaryVal: 835000, variance: 5200, lastCheck: new Date() },
    { module: 'Asset Registry vs Maintenance Cost', status: 'MATCHED', inventoryVal: 12500000, secondaryVal: 12500000, variance: 0, lastCheck: new Date() },
  ];
  res.json({ success: true, data: reconData });
});

router.post('/landed-cost/allocate', authenticate, (req, res) => {
  const { baseAmount, freight, duty, insurance, allocationMethod } = req.body;
  const totalLandedCost = Number(baseAmount || 0) + Number(freight || 0) + Number(duty || 0) + Number(insurance || 0);
  const factor = baseAmount > 0 ? (totalLandedCost / baseAmount).toFixed(4) : 1.0;
  
  res.json({
    success: true,
    data: {
      baseAmount: Number(baseAmount),
      additionalCharges: Number(freight || 0) + Number(duty || 0) + Number(insurance || 0),
      totalLandedCost,
      costMultiplier: Number(factor),
      allocationMethod: allocationMethod || 'BY_VALUE',
      calculatedAt: new Date()
    }
  });
});

module.exports = router;
