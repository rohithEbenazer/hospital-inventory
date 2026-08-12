const Batch = require('../models/Batch');

/**
 * Section 16 FEFO (First Expired First Out) Engine
 * For products requiring expiry tracking:
 * 1. Ignore expired stock (expiryDate <= now or status === 'EXPIRED')
 * 2. Ignore quarantined/recalled stock (qualityStatus !== 'APPROVED' or recallStatus !== 'NORMAL')
 * 3. Select earliest valid expiry (sort by expiryDate ASC)
 * 4. Reserve/allocate from earliest expiry batch
 * 5. Continue to next batch when required (Multi-batch split allocation)
 * 6. Prevent issue beyond total available quantity
 */
const allocateStockFEFO = async (productId, requiredQuantity, hospitalId = 'HOSP-001') => {
  const now = new Date();
  
  const query = {
    productId,
    hospitalId,
    status: { $in: ['AVAILABLE', 'ACTIVE'] },
    qualityStatus: 'APPROVED',
    recallStatus: 'NORMAL',
    expiryDate: { $gt: now },
    currentQuantity: { $gt: 0 }
  };

  // Section 16 Rule 3: Find available batches sorted by earliest expiry date ASC
  const availableBatches = await Batch.find(query).sort({ expiryDate: 1 });

  let remainingToFulfill = requiredQuantity;
  const allocations = [];

  // Section 16 Rule 4 & 5: Reserve from earliest expiry and continue to next batch when required
  for (const batch of availableBatches) {
    if (remainingToFulfill <= 0) break;

    const takeQty = Math.min(batch.currentQuantity, remainingToFulfill);
    allocations.push({
      batchId: batch._id,
      batchNumber: batch.batchNumber,
      lotNumber: batch.lotNumber,
      expiryDate: batch.expiryDate,
      unitCost: batch.unitCost,
      mrp: batch.mrp,
      allocatedQty: takeQty
    });

    remainingToFulfill -= takeQty;
  }

  // Section 16 Rule 6: Prevent issue beyond available quantity
  const isFullyAllocated = remainingToFulfill === 0;

  return {
    success: isFullyAllocated,
    allocations,
    requestedQty: requiredQuantity,
    fulfilledQty: requiredQuantity - remainingToFulfill,
    unfulfilledQty: remainingToFulfill,
    isFullyAllocated
  };
};

module.exports = { allocateStockFEFO };
