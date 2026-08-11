const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Unit = require('../models/Unit');

// Get categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// Create category
router.post('/categories', async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// Get Units
router.get('/units', async (req, res, next) => {
  try {
    const units = await Unit.find();
    res.json({ success: true, data: units });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
