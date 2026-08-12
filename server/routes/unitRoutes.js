const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/v1/units - List all units of measurement
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const units = await Unit.find({ hospitalId, isActive: true });
    res.json({ success: true, count: units.length, data: units });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/units/convert - Section 11 Unit conversion math helper
router.get('/convert', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { fromUnit, toUnit, qty = 1 } = req.query;

    if (!fromUnit || !toUnit) {
      return res.status(400).json({ success: false, message: 'fromUnit and toUnit query parameters are required.' });
    }

    if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
      return res.json({ success: true, fromUnit, toUnit, inputQty: +qty, convertedQty: +qty, conversionFactor: 1 });
    }

    // Lookup unit conversion rule in database
    const unitDoc = await Unit.findOne({ hospitalId, name: new RegExp(`^${fromUnit}$`, 'i') });
    const conversion = unitDoc?.conversions?.find(c => c.toUnit.toLowerCase() === toUnit.toLowerCase());

    const factor = conversion ? conversion.conversionFactor : 1;
    const convertedQty = (+qty) * factor;

    res.json({
      success: true,
      fromUnit,
      toUnit,
      inputQty: +qty,
      convertedQty,
      conversionFactor: factor
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/units/seed - Seed Section 11 Units & Conversions (1 Box = 100 Gloves, 1 Carton = 20 Boxes, 1 Box = 10 Vials)
router.post('/seed', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;

    const seedUnits = [
      { name: 'Box', abbreviation: 'BX', conversions: [{ toUnit: 'Gloves', conversionFactor: 100 }, { toUnit: 'Vials', conversionFactor: 10 }] },
      { name: 'Carton', abbreviation: 'CTN', conversions: [{ toUnit: 'Boxes', conversionFactor: 20 }] },
      { name: 'Pack', abbreviation: 'PK', conversions: [{ toUnit: 'Pieces', conversionFactor: 10 }] },
      { name: 'Piece', abbreviation: 'PC' },
      { name: 'Vial', abbreviation: 'VIAL' },
      { name: 'Ampoule', abbreviation: 'AMP' },
      { name: 'Tablet', abbreviation: 'TAB' },
      { name: 'Capsule', abbreviation: 'CAP' },
      { name: 'Bottle', abbreviation: 'BTL' },
      { name: 'Tube', abbreviation: 'TUBE' },
      { name: 'Kg', abbreviation: 'KG' },
      { name: 'Gram', abbreviation: 'GM' },
      { name: 'Litre', abbreviation: 'LTR' },
      { name: 'Millilitre', abbreviation: 'ML' },
      { name: 'Pair', abbreviation: 'PR' },
      { name: 'Set', abbreviation: 'SET' }
    ];

    for (const u of seedUnits) {
      await Unit.findOneAndUpdate({ hospitalId, name: u.name }, { ...u, hospitalId }, { upsert: true });
    }

    const allUnits = await Unit.find({ hospitalId });
    res.json({ success: true, message: 'Section 11 Units of Measurement & Conversions seeded successfully.', count: allUnits.length, data: allUnits });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/units - Create custom unit
router.post('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const unit = new Unit({ ...req.body, hospitalId });
    await unit.save();
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
