const InventoryBalance = require('../models/InventoryBalance');
const TransactionLedger = require('../models/TransactionLedger');
const AuditLog = require('../models/AuditLog');

/**
 * Section 41 Configurable Valuation Engine
 * Supported Methods: WEIGHTED_AVERAGE, FIFO, SPECIFIC_IDENTIFICATION, LIFO
 */

/**
 * Weighted Average Valuation
 */
async function getWeightedAverageValue(hospitalId = 'HOSP-001', productId = null) {
  const match = { hospitalId };
  if (productId) match.productId = productId;

  const result = await InventoryBalance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productId',
        totalQty: { $sum: '$availableQty' },
        totalValue: { $sum: { $multiply: ['$availableQty', { $ifNull: ['$averageCost', '$unitCost'] }] } }
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
 * FIFO Valuation (First-In, First-Out ledger layer valuation)
 */
async function getFIFOValuation(hospitalId = 'HOSP-001') {
  const balances = await InventoryBalance.find({ hospitalId, availableQty: { $gt: 0 } });
  let totalValuation = 0;
  const breakdown = [];

  for (const item of balances) {
    const inboundTxs = await TransactionLedger.find({
      hospitalId,
      productId: item.productId,
      quantity: { $gt: 0 }
    }).sort({ createdAt: 1 });

    let remainingQtyToValuate = item.availableQty;
    let itemValue = 0;

    for (const tx of inboundTxs) {
      if (remainingQtyToValuate <= 0) break;
      const takeQty = Math.min(remainingQtyToValuate, tx.quantity);
      itemValue += takeQty * (tx.unitCost || item.unitCost || 0);
      remainingQtyToValuate -= takeQty;
    }

    if (remainingQtyToValuate > 0) {
      itemValue += remainingQtyToValuate * (item.unitCost || 0);
    }

    totalValuation += itemValue;
    breakdown.push({
      productId: item.productId,
      productName: item.productName,
      availableQty: item.availableQty,
      fifoValue: itemValue
    });
  }

  return { method: 'FIFO', totalValuation, breakdown };
}

/**
 * Specific Identification Valuation (Exact Batch/Serial cost tracking)
 */
async function getSpecificIdentificationValuation(hospitalId = 'HOSP-001') {
  const balances = await InventoryBalance.find({ hospitalId, availableQty: { $gt: 0 } });
  let totalValuation = 0;
  const breakdown = balances.map(b => {
    const val = b.availableQty * (b.unitCost || b.averageCost || 0);
    totalValuation += val;
    return {
      productId: b.productId,
      productName: b.productName,
      batchNumber: b.batchNumber,
      serialNumber: b.serialNumber,
      availableQty: b.availableQty,
      exactUnitCost: b.unitCost || b.averageCost || 0,
      totalValue: val
    };
  });

  return { method: 'SPECIFIC_IDENTIFICATION', totalValuation, breakdown };
}

/**
 * LIFO Valuation (Last-In, First-Out where jurisdictionally permitted)
 */
async function getLIFOValuation(hospitalId = 'HOSP-001') {
  const balances = await InventoryBalance.find({ hospitalId, availableQty: { $gt: 0 } });
  let totalValuation = 0;
  const breakdown = [];

  for (const item of balances) {
    const inboundTxs = await TransactionLedger.find({
      hospitalId,
      productId: item.productId,
      quantity: { $gt: 0 }
    }).sort({ createdAt: -1 }); // LIFO sorts newest receipts first!

    let remainingQtyToValuate = item.availableQty;
    let itemValue = 0;

    for (const tx of inboundTxs) {
      if (remainingQtyToValuate <= 0) break;
      const takeQty = Math.min(remainingQtyToValuate, tx.quantity);
      itemValue += takeQty * (tx.unitCost || item.unitCost || 0);
      remainingQtyToValuate -= takeQty;
    }

    if (remainingQtyToValuate > 0) {
      itemValue += remainingQtyToValuate * (item.unitCost || 0);
    }

    totalValuation += itemValue;
    breakdown.push({
      productId: item.productId,
      productName: item.productName,
      availableQty: item.availableQty,
      lifoValue: itemValue
    });
  }

  return { method: 'LIFO', totalValuation, breakdown };
}

/**
 * Section 41 Configurable Valuation Master Handler with Audit Trail
 */
async function calculateInventoryValuation(hospitalId = 'HOSP-001', method = 'WEIGHTED_AVERAGE', performedBy = 'System Admin') {
  let result;
  switch (method) {
    case 'FIFO':
      result = await getFIFOValuation(hospitalId);
      break;
    case 'SPECIFIC_IDENTIFICATION':
      result = await getSpecificIdentificationValuation(hospitalId);
      break;
    case 'LIFO':
      result = await getLIFOValuation(hospitalId);
      break;
    case 'WEIGHTED_AVERAGE':
    default:
      const avg = await getWeightedAverageValue(hospitalId);
      const totalValuation = avg.reduce((acc, curr) => acc + curr.totalValue, 0);
      result = { method: 'WEIGHTED_AVERAGE', totalValuation, breakdown: avg };
      break;
  }

  await AuditLog.create({
    action: 'INVENTORY_VALUATION_CALCULATED',
    module: 'FINANCIAL',
    performedBy,
    details: `Calculated total inventory valuation using ${method} method: ₹${result.totalValuation.toLocaleString()}`
  });

  return result;
}

module.exports = {
  getWeightedAverageValue,
  getFIFOValuation,
  getSpecificIdentificationValuation,
  getLIFOValuation,
  calculateInventoryValuation
};
