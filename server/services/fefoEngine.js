const Batch = require('../models/Batch');

/**
 * FEFO (First Expired First Out) Engine
 * Selects batches for a given product sorted by expiry date ASC.
 * Excludes expired, quarantined, or recalled batches.
 */
const allocateStockFEFO = async (productId, requiredQuantity) => {
  const now = new Date();
  
  // Find available batches for this product sorted by earliest expiry date
  const availableBatches = await Batch.find({
    productId,
    status: 'AVAILABLE',
    qualityStatus: 'APPROVED',
    recallStatus: 'NORMAL',
    expiryDate: { $gt: now },
    currentQuantity: { $gt: 0 }
  }).sort({ expiryDate: 1 });

  let remainingToFulfill = requiredQuantity;
  const allocations = [];

  for (const batch of availableBatches) {
    if (remainingToFulfill <= 0) break;

    const takeQty = Math.min(batch.currentQuantity, remainingToFulfill);
    allocations.push({
      batchId: batch._id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      unitCost: batch.unitCost,
      mrp: batch.mrp,
      allocatedQty: takeQty
    });

    remainingToFulfill -= takeQty;
  }

  const isFullyAllocated = remainingToFulfill === 0;

  return {
    allocations,
    fulfilledQty: requiredQuantity - remainingToFulfill,
    unfulfilledQty: remainingToFulfill,
    isFullyAllocated
  };
};

module.exports = { allocateStockFEFO };
