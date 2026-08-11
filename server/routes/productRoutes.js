const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// Get all products with filtering & search
router.get('/', async (req, res, next) => {
  try {
    const { itemType, search, controlledOnly } = req.query;
    const query = { isActive: true };

    if (itemType && itemType !== 'ALL') query.itemType = itemType;
    if (controlledOnly === 'true') query.controlledItem = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const productData = req.body;
    if (!productData.sku) {
      productData.sku = 'SKU-' + Math.floor(100000 + Math.random() * 900000);
    }
    const product = new Product(productData);
    await product.save();

    await AuditLog.create({
      action: 'PRODUCT_CREATED',
      module: 'PRODUCT',
      performedBy: req.user?.fullName || 'Admin User',
      userRole: req.user?.role || 'STORE_MANAGER',
      details: `Created product ${product.name} (SKU: ${product.sku})`
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
