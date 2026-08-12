const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all product routes
router.use(authenticateToken);

// Get all products with filtering & search (scoped by hospitalId)
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { itemType, search, controlledOnly } = req.query;
    const query = { isActive: true, hospitalId };

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

// Create product (scoped by hospitalId)
router.post('/', async (req, res, next) => {
  try {
    const productData = { ...req.body, hospitalId: req.user.hospitalId };
    if (!productData.sku) {
      productData.sku = 'SKU-' + Math.floor(100000 + Math.random() * 900000);
    }
    const product = new Product(productData);
    await product.save();

    await AuditLog.create({
      hospitalId: req.user.hospitalId,
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

// Update product (scoped by hospitalId)
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
