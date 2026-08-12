const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const TransactionLedger = require('../models/TransactionLedger');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all product routes
router.use(authenticateToken);

// GET /api/v1/products - Search & filter products (scoped by hospitalId)
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { itemType, search, controlledOnly, categoryId } = req.query;
    const query = { isActive: true, hospitalId };

    if (itemType && itemType !== 'ALL') query.itemType = itemType;
    if (controlledOnly === 'true') query.controlledItem = true;
    if (categoryId) query.categoryId = categoryId;

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

// GET /api/v1/products/:id - Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products - Create product (Section 9.2 Rules)
router.post('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const productData = { ...req.body, hospitalId, createdBy: req.user.userId };

    if (!productData.sku) {
      productData.sku = 'SKU-' + Math.floor(100000 + Math.random() * 900000);
    }

    // Controlled items permission check
    if (productData.controlledItem && !['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Controlled narcotic products require Pharmacist or Admin authorization.'
      });
    }

    const product = new Product(productData);
    await product.save();

    await AuditLog.create({
      hospitalId,
      action: 'PRODUCT_CREATED',
      module: 'PRODUCT',
      performedBy: req.user?.fullName || 'Admin User',
      userRole: req.user?.role || 'STORE_MANAGER',
      details: `Created product ${product.name} (SKU: ${product.sku})`
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: SKU or Barcode already exists for this hospital.'
      });
    }
    next(err);
  }
});

// PUT /api/v1/products/:id - Update product
router.put('/:id', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;

    if (req.body.controlledItem && !['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Controlled narcotic products require Pharmacist or Admin authorization.'
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, hospitalId },
      { ...req.body, updatedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/products/:id - Section 9.2 Soft Delete Protection
router.delete('/:id', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const productId = req.params.id;

    const txCount = await TransactionLedger.countDocuments({ hospitalId, productId });

    if (txCount > 0) {
      // Section 9.2 Rule: Cannot hard-delete product after transactions exist -> Soft delete
      const updated = await Product.findOneAndUpdate(
        { _id: productId, hospitalId },
        { isActive: false, updatedBy: req.user.userId },
        { new: true }
      );

      await AuditLog.create({
        hospitalId,
        action: 'PRODUCT_SOFT_DELETED',
        module: 'PRODUCT',
        performedBy: req.user?.fullName || 'Admin User',
        userRole: req.user?.role || 'STORE_MANAGER',
        details: `Soft deleted product ${updated.name} because ${txCount} transactions exist.`
      });

      return res.json({
        success: true,
        message: `Product contains ${txCount} historical transactions. Marked as inactive (Soft Delete).`,
        data: updated
      });
    }

    // No transactions -> Safe hard delete
    const deleted = await Product.findOneAndDelete({ _id: productId, hospitalId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product hard deleted successfully.', data: deleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
