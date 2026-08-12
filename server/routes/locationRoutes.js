const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all locations (optionally filtered by warehouse)
router.get('/', authenticate, async (req, res) => {
  try {
    const { warehouseId, page = 1, limit = 100 } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (warehouseId) filter.warehouseId = warehouseId;

    const [data, total] = await Promise.all([
      Location.find(filter)
        .populate('warehouseId', 'name')
        .sort({ name: 1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      Location.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single location
router.get('/:id', authenticate, async (req, res) => {
  try {
    const loc = await Location.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId })
      .populate('warehouseId', 'name');
    if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: loc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create location
router.post('/', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const loc = await Location.create({ ...req.body, hospitalId: req.user.hospitalId });
    res.status(201).json({ success: true, message: 'Location created', data: loc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update location
router.patch('/:id', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const loc = await Location.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: loc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE location
router.delete('/:id', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    await Location.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
