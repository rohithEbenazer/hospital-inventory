const Batch = require('../models/Batch');

/**
 * FEFO (First Expired First Out) Engine
 * Selects batches for a given product sorted by expiry date ASC.
 * Excludes expired, quarantined, recalled, or blocked batches.
 */
const allocateStockFEFO = async (productId, requiredQuantity, hospitalId = null) => {
  const now = new Date();
  
  const query = {
    productId,
    status: { $in: ['AVAILABLE', 'ACTIVE'] },
    qualityStatus: { $nin: ['REJECTED', 'QUARANTINED', 'PENDING'] },
    recallStatus: { $nin: ['RECALLED', 'PARTIALLY_RECALLED'] },
    expiryDate: { $gt: now },
    currentQuantity: { $gt: 0 }
  };

  if (hospitalId) {
    query.hospitalId = hospitalId;
  }

  // Find available batches for this product sorted by earliest expiry date
  const availableBatches = await Batch.find(query).sort({ expiryDate: 1 });

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
