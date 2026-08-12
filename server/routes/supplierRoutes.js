const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const SupplierContract = require('../models/SupplierContract');
const { authenticate, requireRole } = require('../middleware/auth');

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25, search, status } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      Supplier.find(filter).sort({ name: 1 }).skip((+page - 1) * +limit).limit(+limit),
      Supplier.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authenticate, requireRole('admin', 'store_manager', 'purchase_officer'), async (req, res) => {
  try {
    const supplier = await Supplier.create({ ...req.body, hospitalId: req.user.hospitalId });
    res.status(201).json({ success: true, message: 'Supplier created', data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id', authenticate, requireRole('admin', 'store_manager', 'purchase_officer'), async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await Supplier.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

router.get('/:id/contracts', authenticate, async (req, res) => {
  try {
    const contracts = await SupplierContract.find({ supplierId: req.params.id, hospitalId: req.user.hospitalId }).sort({ endDate: 1 });
    res.json({ success: true, data: contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/contracts', authenticate, requireRole('admin', 'purchase_officer'), async (req, res) => {
  try {
    const contract = await SupplierContract.create({
      ...req.body,
      supplierId: req.params.id,
      hospitalId: req.user.hospitalId,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Contract created', data: contract });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

router.get('/:id/performance', authenticate, async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrder');
    const GoodsReceipt = require('../models/GoodsReceipt');

    const pos = await PurchaseOrder.countDocuments({ supplierId: req.params.id, hospitalId: req.user.hospitalId });
    const grns = await GoodsReceipt.countDocuments({ supplierId: req.params.id, hospitalId: req.user.hospitalId });
    const onTime = await PurchaseOrder.countDocuments({ supplierId: req.params.id, hospitalId: req.user.hospitalId, status: 'RECEIVED' });

    res.json({
      success: true, data: {
        totalOrders: pos,
        totalGRNs: grns,
        onTimeDeliveries: onTime,
        onTimeRate: pos > 0 ? ((onTime / pos) * 100).toFixed(1) + '%' : 'N/A',
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
