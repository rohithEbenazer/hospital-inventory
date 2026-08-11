const express = require('express');
const router = express.Router();
const InventoryBalance = require('../models/InventoryBalance');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const Indent = require('../models/Indent');
const PurchaseOrder = require('../models/PurchaseOrder');
const TransactionLedger = require('../models/TransactionLedger');
const AuditLog = require('../models/AuditLog');

// Get Dashboard KPIs & Chart Summaries
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const balances = await InventoryBalance.find();
    let totalStockValue = 0;
    let availableStockCount = 0;

    balances.forEach(b => {
      totalStockValue += b.totalStockValue || 0;
      availableStockCount += b.availableQty || 0;
    });

    const now = new Date();
    const future90 = new Date();
    future90.setDate(future90.getDate() + 90);

    const expiredCount = await Batch.countDocuments({ expiryDate: { $lte: now } });
    const nearExpiryCount = await Batch.countDocuments({ expiryDate: { $gt: now, $lte: future90 } });
    const lowStockCount = await Product.countDocuments({ minStock: { $gte: 50 } }); // low stock filter simulation
    const pendingIndentsCount = await Indent.countDocuments({ status: 'PENDING_APPROVAL' });
    const openPOsCount = await PurchaseOrder.countDocuments({ status: { $in: ['SUBMITTED', 'APPROVED', 'SENT_TO_SUPPLIER'] } });

    // Category distribution for charts
    const categoryStats = [
      { name: 'Medicines', value: 45, color: '#6366f1' },
      { name: 'Medical Consumables', value: 25, color: '#06b6d4' },
      { name: 'Surgical Supplies', value: 15, color: '#10b981' },
      { name: 'Lab Reagents', value: 10, color: '#f59e0b' },
      { name: 'Equipment Assets', value: 5, color: '#ec4899' }
    ];

    // Consumption trend monthly
    const consumptionTrend = [
      { month: 'Jan', consumption: 120000, purchases: 140000 },
      { month: 'Feb', consumption: 135000, purchases: 130000 },
      { month: 'Mar', consumption: 150000, purchases: 165000 },
      { month: 'Apr', consumption: 142000, purchases: 125000 },
      { month: 'May', consumption: 168000, purchases: 180000 },
      { month: 'Jun', consumption: 175000, purchases: 170000 }
    ];

    res.json({
      success: true,
      kpi: {
        totalStockValue,
        availableStockCount,
        nearExpiryCount,
        expiredCount,
        lowStockCount,
        pendingIndentsCount,
        openPOsCount
      },
      categoryStats,
      consumptionTrend
    });
  } catch (err) {
    next(err);
  }
});

// Audit Logs Endpoint
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
