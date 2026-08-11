const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');

// Get all stores/warehouses
router.get('/', async (req, res, next) => {
  try {
    const stores = await Warehouse.find({ isActive: true });
    res.json({ success: true, data: stores });
  } catch (err) {
    next(err);
  }
});

// Create warehouse
router.post('/', async (req, res, next) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
