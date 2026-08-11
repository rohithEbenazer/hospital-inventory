const express = require('express');
const router = express.Router();
const SerialNumber = require('../models/SerialNumber');
const Product = require('../models/Product');

// Get serial numbers / asset list
router.get('/', async (req, res, next) => {
  try {
    const assets = await SerialNumber.find().sort({ createdAt: -1 });
    res.json({ success: true, data: assets });
  } catch (err) {
    next(err);
  }
});

// Register new serial asset
router.post('/', async (req, res, next) => {
  try {
    const assetData = req.body;
    const product = await Product.findById(assetData.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    assetData.productName = product.name;
    const asset = new SerialNumber(assetData);
    await asset.save();

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

// Update Asset status (e.g. Under Maintenance / Calibrated)
router.put('/:id', async (req, res, next) => {
  try {
    const asset = await SerialNumber.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
