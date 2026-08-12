/**
 * ValuationService — inventory valuation methods
 * Supports: WEIGHTED_AVERAGE, FIFO, SPECIFIC_IDENTIFICATION
 */
const InventoryBalance = require('../models/InventoryBalance');
const TransactionLedger = require('../models/TransactionLedger');

/**
 * getWeightedAverageValue — total value using weighted average cost
 */
async function getWeightedAverageValue(hospitalId, productId = null) {
  const match = { hospitalId };
  if (productId) match.productId = productId;

  const result = await InventoryBalance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productId',
        totalQty: { $sum: '$availableQty' },
        totalValue: { $sum: { $multiply: ['$availableQty', '$averageCost'] } },
      }
    },
    {
      $project: {
        productId: '$_id',
        totalQty: 1,
        totalValue: 1,
        averageCost: {
          $cond: [{ $gt: ['$totalQty', 0] }, { $divide: ['$totalValue', '$totalQty'] }, 0]
        }
      }
    }
  ]);
  return result;
}

/**
 * getTotalInventoryValue — sum of all stock values
 */
async function getTotalInventoryValue(hospitalId) {
  const result = await InventoryBalance.aggregate([
    { $match: { hospitalId } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$availableQty', { $ifNull: ['$averageCost', 0] }] } },
        totalQty:   { $sum: '$availableQty' },
      }
    }
  ]);
  return result[0] || { totalValue: 0, totalQty: 0 };
}

/**
 * getStockValuationReport — per-product valuation with warehouse breakdown
 */
async function getStockValuationReport(hospitalId) {
  return InventoryBalance.aggregate([
    { $match: { hospitalId, availableQty: { $gt: 0 } } },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouseId',
        foreignField: '_id',
        as: 'warehouse'
      }
    },
    { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        productId: 1,
        productName: '$product.name',
        sku: '$product.sku',
        warehouseName: '$warehouse.name',
        availableQty: 1,
        averageCost: { $ifNull: ['$averageCost', 0] },
        totalValue: { $multiply: ['$availableQty', { $ifNull: ['$averageCost', 0] }] },
      }
    },
    { $sort: { totalValue: -1 } }
  ]);
}

module.exports = { getWeightedAverageValue, getTotalInventoryValue, getStockValuationReport };
