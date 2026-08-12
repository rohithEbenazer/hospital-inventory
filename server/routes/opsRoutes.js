const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Operational state stores
let taskInbox = [
  { _id: 'tsk-001', taskType: 'PENDING_APPROVAL', title: 'Stock Adjustment Approval Needed', department: 'Central Store', priority: 'HIGH', slaDue: 'In 2 hours', assignee: 'Store Manager', status: 'PENDING' },
  { _id: 'tsk-002', taskType: 'PENDING_RECEIPT', title: 'Goods Receipt GRN Inspection', department: 'Pharmacy Store', priority: 'MEDIUM', slaDue: 'Today 5 PM', assignee: 'Pharmacist', status: 'PENDING' },
  { _id: 'tsk-003', taskType: 'RECALL_NOTICE', title: 'Quarantine Batch BAT-AMO-9942', department: 'ICU Store', priority: 'CRITICAL', slaDue: 'IMMEDIATE', assignee: 'Store Keeper', status: 'PENDING' },
  { _id: 'tsk-004', taskType: 'CYCLE_COUNT', title: 'Quarterly Physical Count Verification', department: 'OT Store', priority: 'MEDIUM', slaDue: 'Tomorrow', assignee: 'Inventory Auditor', status: 'PENDING' },
];

let jobSchedulerList = [
  { _id: 'job-001', jobId: 'ExpiryAlertJob', schedule: 'Hourly (0 * * * *)', owner: 'System Job', status: 'RUNNING', lastRun: new Date(), nextRun: new Date(Date.now() + 3600000), failureCount: 0, retryCount: 0 },
  { _id: 'job-002', jobId: 'LowStockJob', schedule: 'Every 4 hours (0 */4 * * *)', owner: 'System Job', status: 'RUNNING', lastRun: new Date(), nextRun: new Date(Date.now() + 14400000), failureCount: 0, retryCount: 0 },
  { _id: 'job-003', jobId: 'ReconciliationSyncJob', schedule: 'Daily at midnight (0 0 * * *)', owner: 'Finance Integration', status: 'IDLE', lastRun: new Date(Date.now() - 43200000), nextRun: new Date(Date.now() + 43200000), failureCount: 0, retryCount: 0 },
];

let shiftRecords = [
  { _id: 'shf-001', shiftName: 'Morning Shift', storekeeper: 'John Doe (Storekeeper)', openingBal: 1250, receipts: 400, issues: 320, returns: 15, adjustments: -5, expectedClosing: 1340, actualClosing: 1340, variance: 0, status: 'CLOSED', supervisor: 'Sarah Jenkins (Manager)' },
  { _id: 'shf-002', shiftName: 'Evening Shift', storekeeper: 'Michael Chang (Storekeeper)', openingBal: 1340, receipts: 150, issues: 210, returns: 10, adjustments: 0, expectedClosing: 1290, actualClosing: 1290, variance: 0, status: 'ACTIVE', supervisor: 'Sarah Jenkins (Manager)' },
];

let sparePartsCatalog = [
  { _id: 'sp-001', partNumber: 'SP-VENT-O2-VALVE', name: 'Oxygen Flow Control Valve', category: 'Biomedical Spare Parts', compatibleEquipment: 'Ventilator ICU-V200', inStock: 14, minStock: 3, unitCost: 3500 },
  { _id: 'sp-002', partNumber: 'SP-HVAC-HEPA-FIL', name: 'HEPA Filter Assembly Grade-14', category: 'HVAC Spare Parts', compatibleEquipment: 'OT Laminar Flow Hood', inStock: 8, minStock: 2, unitCost: 8200 },
  { _id: 'sp-003', partNumber: 'SP-MON-ECG-CAB', name: '12-Lead Shielded ECG Cable', category: 'Biomedical Spare Parts', compatibleEquipment: 'Patient Monitor M-9500', inStock: 22, minStock: 5, unitCost: 1200 },
];

let workOrders = [
  { _id: 'wo-101', workOrderNumber: 'WO-2026-0042', equipmentName: 'Ventilator ICU-01', technician: 'Biomedical Tech Alex', sparePart: 'Oxygen Flow Control Valve', reservedQty: 1, status: 'RESERVED', createdAt: new Date() }
];

// --- 1. TASK INBOX (Section 258) ---
router.get('/task-inbox', authenticate, (req, res) => {
  res.json({ success: true, data: taskInbox });
});

router.post('/task-inbox/:id/complete', authenticate, (req, res) => {
  const tsk = taskInbox.find(t => t._id === req.params.id);
  if (!tsk) return res.status(404).json({ success: false, message: 'Task not found' });
  tsk.status = 'COMPLETED';
  res.json({ success: true, message: `Task ${tsk.title} completed cleanly`, data: tsk });
});

// --- 2. JOB SCHEDULER GOVERNANCE (Sections 249-250) ---
router.get('/jobs', authenticate, (req, res) => {
  res.json({ success: true, data: jobSchedulerList });
});

router.post('/jobs/:id/toggle', authenticate, (req, res) => {
  const job = jobSchedulerList.find(j => j._id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  job.status = job.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
  res.json({ success: true, message: `Job ${job.jobId} status is now ${job.status}`, data: job });
});

// --- 3. SHIFT MANAGEMENT & HANDOVER (Sections 260-261) ---
router.get('/shifts', authenticate, (req, res) => {
  res.json({ success: true, data: shiftRecords });
});

router.post('/shifts/handover', authenticate, (req, res) => {
  const { shiftName, storekeeper, openingBal, receipts, issues, returns, adjustments, actualClosing } = req.body;
  const expectedClosing = Number(openingBal || 0) + Number(receipts || 0) - Number(issues || 0) + Number(returns || 0) + Number(adjustments || 0);
  const variance = Number(actualClosing || expectedClosing) - expectedClosing;

  const newShift = {
    _id: 'shf-' + Date.now(),
    shiftName: shiftName || 'New Shift',
    storekeeper: storekeeper || req.user.fullName,
    openingBal: Number(openingBal || 0),
    receipts: Number(receipts || 0),
    issues: Number(issues || 0),
    returns: Number(returns || 0),
    adjustments: Number(adjustments || 0),
    expectedClosing,
    actualClosing: Number(actualClosing || expectedClosing),
    variance,
    status: 'CLOSED',
    supervisor: req.user.fullName + ' (Manager)'
  };
  shiftRecords.unshift(newShift);
  res.status(201).json({ success: true, message: 'Shift handover signed off cleanly', data: newShift });
});

// --- 4. SPARE PARTS & WORK ORDER RESERVATIONS (Sections 270-272) ---
router.get('/spare-parts', authenticate, (req, res) => {
  res.json({ success: true, data: sparePartsCatalog, workOrders });
});

router.post('/work-orders/reserve', authenticate, (req, res) => {
  const { equipmentName, technician, partId, qty } = req.body;
  const part = sparePartsCatalog.find(p => p._id === partId);
  if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });
  if (part.inStock < Number(qty || 1)) return res.status(400).json({ success: false, message: 'Insufficient spare parts in stock' });

  part.inStock -= Number(qty || 1);
  const newWO = {
    _id: 'wo-' + Date.now(),
    workOrderNumber: 'WO-2026-00' + Math.floor(100 + Math.random() * 900),
    equipmentName: equipmentName || 'Biomedical Equipment',
    technician: technician || req.user.fullName,
    sparePart: part.name,
    reservedQty: Number(qty || 1),
    status: 'RESERVED',
    createdAt: new Date()
  };
  workOrders.unshift(newWO);
  res.status(201).json({ success: true, message: `Spare part ${part.name} reserved for Work Order ${newWO.workOrderNumber}`, data: newWO });
});

module.exports = router;
