const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all departments (scoped to hospital)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Department.find(filter)
        .populate('headId', 'name email')
        .populate('warehouseId', 'name')
        .sort({ name: 1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      Department.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single department
router.get('/:id', authenticate, async (req, res) => {
  try {
    const dept = await Department.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId })
      .populate('headId', 'name email')
      .populate('warehouseId', 'name');
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found', code: 'DEPT_NOT_FOUND' });
    res.json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create department
router.post('/', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const dept = await Department.create({ ...req.body, hospitalId: req.user.hospitalId });
    res.status(201).json({ success: true, message: 'Department created', data: dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update department
router.patch('/:id', authenticate, requireRole('admin', 'store_manager'), async (req, res) => {
  try {
    const dept = await Department.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department updated', data: dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE department
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await Department.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
