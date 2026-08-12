const express = require('express');
const router = express.Router();
const MaintenanceTicket = require('../models/MaintenanceTicket');
const CalibrationRecord = require('../models/CalibrationRecord');
const { authenticate, requireRole } = require('../middleware/auth');

// ─── ASSETS (full model) ─────────────────────────────────────────────────────

const assetSchema = {
  assetId: String, productId: String, serialNumber: String,
  manufacturer: String, model: String, purchaseDate: Date,
  purchaseCost: Number, supplierId: String, warrantyStart: Date, warrantyEnd: Date,
  amcStart: Date, amcEnd: Date, departmentId: String, locationId: String,
  assignedUserId: String, status: String, condition: String,
  lastMaintenanceDate: Date, nextMaintenanceDate: Date,
  lastCalibrationDate: Date, nextCalibrationDate: Date,
};

// Use the existing MedicalAsset model if it exists, else create inline
let MedicalAsset;
try { MedicalAsset = require('../models/MedicalAsset'); }
catch {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assetTag: { type: String, unique: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    serialNumber: String, manufacturer: String, model: String,
    purchaseDate: Date, purchaseCost: Number,
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    warrantyStart: Date, warrantyEnd: Date,
    amcStart: Date, amcEnd: Date,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE','IN_MAINTENANCE','UNDER_REPAIR','RETIRED','DISPOSED','CALIBRATION_DUE'], default: 'ACTIVE' },
    condition: { type: String, enum: ['GOOD','FAIR','POOR','CRITICAL'], default: 'GOOD' },
    lastMaintenanceDate: Date, nextMaintenanceDate: Date,
    lastCalibrationDate: Date, nextCalibrationDate: Date,
    notes: String,
  }, { timestamps: true });
  schema.index({ hospitalId: 1, status: 1 });
  MedicalAsset = require('mongoose').model('MedicalAsset', schema);
}

// GET all assets
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25, status, departmentId, search } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { serialNumber: { $regex: search, $options: 'i' } }, { assetTag: { $regex: search, $options: 'i' } }];

    const [data, total] = await Promise.all([
      MedicalAsset.find(filter)
        .populate('departmentId', 'name')
        .populate('supplierId', 'name')
        .sort({ name: 1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      MedicalAsset.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const asset = await MedicalAsset.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId })
      .populate('departmentId', 'name').populate('supplierId', 'name');
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const count = await MedicalAsset.countDocuments({ hospitalId: req.user.hospitalId });
    const asset = await MedicalAsset.create({
      ...req.body, hospitalId: req.user.hospitalId,
      assetTag: req.body.assetTag || `AST-${String(count + 1).padStart(5, '0')}`,
    });
    res.status(201).json({ success: true, message: 'Asset registered', data: asset });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const asset = await MedicalAsset.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body }, { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── MAINTENANCE TICKETS ─────────────────────────────────────────────────────

router.get('/:id/maintenance', authenticate, async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({ assetId: req.params.id, hospitalId: req.user.hospitalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/maintenance', authenticate, async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.create({
      ...req.body, assetId: req.params.id, hospitalId: req.user.hospitalId, reportedBy: req.user.id
    });
    res.status(201).json({ success: true, message: 'Maintenance ticket created', data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/maintenance/:ticketId', authenticate, async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findOneAndUpdate(
      { _id: req.params.ticketId, hospitalId: req.user.hospitalId },
      { $set: req.body }, { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── CALIBRATION RECORDS ─────────────────────────────────────────────────────

router.get('/:id/calibrations', authenticate, async (req, res) => {
  try {
    const records = await CalibrationRecord.find({ assetId: req.params.id, hospitalId: req.user.hospitalId }).sort({ calibrationDate: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/calibrations', authenticate, requireRole('admin', 'store_manager', 'biomedical'), async (req, res) => {
  try {
    const record = await CalibrationRecord.create({
      ...req.body, assetId: req.params.id, hospitalId: req.user.hospitalId, performedBy: req.user.id
    });
    // Update next calibration date on asset
    await MedicalAsset.findByIdAndUpdate(req.params.id, {
      $set: { lastCalibrationDate: record.calibrationDate, nextCalibrationDate: record.nextCalibrationDue }
    });
    res.status(201).json({ success: true, message: 'Calibration record added', data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
