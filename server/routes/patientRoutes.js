const express = require('express');
const router = express.Router();
const PatientConsumption = require('../models/PatientConsumption');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all patient consumptions
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25, patientId, departmentId, startDate, endDate } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (patientId) filter.patientId = patientId;
    if (departmentId) filter.departmentId = departmentId;
    if (startDate || endDate) {
      filter.consumedAt = {};
      if (startDate) filter.consumedAt.$gte = new Date(startDate);
      if (endDate) filter.consumedAt.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      PatientConsumption.find(filter)
        .populate('productId', 'name sku unit')
        .populate('departmentId', 'name')
        .populate('consumedBy', 'name')
        .sort({ consumedAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      PatientConsumption.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST log patient consumption
router.post('/', authenticate, async (req, res) => {
  try {
    const { quantity = 0, unitCost = 0 } = req.body;
    const consumption = await PatientConsumption.create({
      ...req.body,
      hospitalId: req.user.hospitalId,
      totalCost: quantity * unitCost,
      consumedBy: req.user.id,
      consumedAt: new Date(),
    });
    res.status(201).json({ success: true, message: 'Patient consumption recorded', data: consumption });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET summary by department
router.get('/summary/department', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { hospitalId: req.user.hospitalId };
    if (startDate || endDate) {
      match.consumedAt = {};
      if (startDate) match.consumedAt.$gte = new Date(startDate);
      if (endDate) match.consumedAt.$lte = new Date(endDate);
    }

    const data = await PatientConsumption.aggregate([
      { $match: match },
      { $group: { _id: '$departmentId', totalQty: { $sum: '$quantity' }, totalCost: { $sum: '$totalCost' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { departmentName: '$dept.name', totalQty: 1, totalCost: 1 } },
      { $sort: { totalCost: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
