const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all stores/warehouses (scoped by hospitalId)
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const stores = await Warehouse.find({ isActive: true, hospitalId });
    res.json({ success: true, data: stores });
  } catch (err) {
    next(err);
  }
});

// Create warehouse (scoped by hospitalId)
router.post('/', async (req, res, next) => {
  try {
    const warehouseData = { ...req.body, hospitalId: req.user.hospitalId };
    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
