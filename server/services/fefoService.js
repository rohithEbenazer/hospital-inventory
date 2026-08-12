/**
 * FEFOService — First Expiry First Out batch selection
 * Returns ordered list of batches to consume for a given product/warehouse/quantity
 */
const Batch = require('../models/Batch');
const InventoryBalance = require('../models/InventoryBalance');

/**
 * selectBatches — select batches for a given issue using FEFO
 * @param {ObjectId} hospitalId
 * @param {ObjectId} productId
 * @param {ObjectId} warehouseId
 * @param {number} requiredQty
 * @param {ClientSession} session
 * @returns {Array} [{batchId, batchNumber, quantity, unitCost}]
 */
async function selectBatches(hospitalId, productId, warehouseId, requiredQty, session = null) {
  // Find all available batches for this product in this warehouse, sorted by earliest expiry
  const balances = await InventoryBalance.find({
    hospitalId,
    productId,
    warehouseId,
    availableQty: { $gt: 0 },
  })
    .populate({
      path: 'batchId',
      match: {
        status: { $in: ['ACTIVE', 'AVAILABLE'] },
        expiryDate: { $gt: new Date() },
      },
    })
    .sort({ 'batchId.expiryDate': 1 })
    .session(session || null);

  // Filter out records where batch didn't match (blocked/recalled/expired)
  const usable = balances.filter(b => b.batchId !== null);

  if (!usable.length) {
    throw new Error('INSUFFICIENT_STOCK: No usable batches available');
  }

  const selections = [];
  let remaining = requiredQty;

  for (const bal of usable) {
    if (remaining <= 0) break;
    const take = Math.min(bal.availableQty, remaining);
    selections.push({
      batchId: bal.batchId._id,
      batchNumber: bal.batchId.batchNumber,
      expiryDate: bal.batchId.expiryDate,
      quantity: take,
      unitCost: bal.batchId.purchasePrice || 0,
      balanceId: bal._id,
    });
    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error(`INSUFFICIENT_STOCK: Needed ${requiredQty}, available ${requiredQty - remaining}`);
  }

  return selections;
}

/**
 * getExpiringBatches — return all batches expiring within `days`
 */
async function getExpiringBatches(hospitalId, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return Batch.find({
    hospitalId,
    status: { $in: ['ACTIVE', 'AVAILABLE'] },
    expiryDate: { $lte: cutoff, $gt: new Date() },
  })
    .populate('productId', 'name sku unit')
    .sort({ expiryDate: 1 });
}

/**
 * getExpiredBatches — return all expired batches that are still "active"
 */
async function getExpiredBatches(hospitalId) {
  return Batch.find({
    hospitalId,
    status: { $in: ['ACTIVE', 'AVAILABLE'] },
    expiryDate: { $lte: new Date() },
  }).populate('productId', 'name sku unit');
}

module.exports = { selectBatches, getExpiringBatches, getExpiredBatches };
