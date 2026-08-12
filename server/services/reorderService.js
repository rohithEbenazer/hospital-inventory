/**
 * ReorderService — Reorder point calculation and alert generation
 * Reorder Point = (Average Daily Consumption × Lead Time) + Safety Stock
 */
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');
const { notifyLowStock } = require('./notificationService');

/**
 * Calculate reorder point for a product
 */
function calcReorderPoint(product) {
  const avgDailyConsumption = product.avgDailyConsumption || 0;
  const leadTimeDays = product.leadTimeDays || 7;
  const safetyStock = product.safetyStock || product.reorderPoint || 0;
  return (avgDailyConsumption * leadTimeDays) + safetyStock;
}

/**
 * Calculate recommended order quantity
 * = Target Stock - Available Stock - Confirmed Incoming Stock
 */
function calcOrderQuantity(product, availableQty, incomingQty = 0) {
  const targetStock = product.maxStock || (product.reorderPoint * 3) || 100;
  return Math.max(0, targetStock - availableQty - incomingQty);
}

/**
 * checkLowStock — check all products in a hospital and trigger notifications
 */
async function checkLowStock(hospitalId) {
  const products = await Product.find({ hospitalId, isActive: true });

  for (const product of products) {
    const reorderPoint = calcReorderPoint(product);

    const balances = await InventoryBalance.aggregate([
      { $match: { hospitalId, productId: product._id } },
      { $group: { _id: null, totalAvailable: { $sum: '$availableQty' } } },
    ]);

    const totalAvailable = balances[0]?.totalAvailable || 0;

    if (totalAvailable <= reorderPoint) {
      await notifyLowStock({
        hospitalId,
        productId: product._id,
        productName: product.name,
        currentQty: totalAvailable,
        reorderPoint,
      });
    }
  }
}

module.exports = { calcReorderPoint, calcOrderQuantity, checkLowStock };
