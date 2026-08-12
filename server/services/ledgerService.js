const mongoose = require('mongoose');
const TransactionLedger = require('../models/TransactionLedger');
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');

/**
 * Section 14 & 15 Atomic Inventory Transaction Engine
 * The transaction ledger is the authoritative source of truth.
 */
const recordStockTransaction = async ({
  hospitalId = 'HOSP-001',
  productId,
  warehouseId,
  warehouseName = 'Central Main Warehouse',
  locationId,
  locationCode,
  batchId,
  batchNumber,
  serialNumberId,
  serialNumber,
  transactionType,
  referenceType = 'SYSTEM',
  referenceId = 'REF-001',
  quantity, // positive for stock IN, negative for stock OUT
  unitCost,
  reason,
  performedBy = 'System Admin',
  approvedBy,
  metadata
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findOne({ _id: productId, hospitalId }).session(session);
    if (!product) throw new Error(`Product ${productId} not found for hospital ${hospitalId}`);

    const cost = unitCost !== undefined ? unitCost : product.unitCost;

    // Section 13: Find or create InventoryBalance using composite key
    const query = { hospitalId, productId };
    if (warehouseId) query.warehouseId = warehouseId;
    else if (warehouseName) query.warehouseName = warehouseName;
    if (locationId) query.locationId = locationId;
    if (batchId) query.batchId = batchId;
    if (serialNumberId) query.serialNumberId = serialNumberId;

    let balance = await InventoryBalance.findOne(query).session(session);

    if (!balance) {
      if (quantity < 0) {
        throw new Error(`INSUFFICIENT_STOCK: Cannot issue ${Math.abs(quantity)} units. Current stock is 0.`);
      }
      balance = new InventoryBalance({
        hospitalId,
        productId: product._id,
        productSku: product.sku,
        productName: product.name,
        warehouseId,
        warehouseName,
        locationId,
        locationCode,
        batchId,
        batchNumber,
        serialNumberId,
        serialNumber,
        availableQty: 0,
        averageCost: cost,
        lastCost: cost,
        unitCost: cost,
        stockValue: 0
      });
    }

    // Zero negative stock validation invariant
    const newQty = balance.availableQty + quantity;
    if (newQty < 0) {
      throw new Error(`INSUFFICIENT_STOCK: Cannot deduct ${Math.abs(quantity)} units of ${product.name}. Available stock is only ${balance.availableQty} units.`);
    }

    // Weighted average cost update for incoming stock
    if (quantity > 0 && cost > 0) {
      const currentVal = balance.availableQty * (balance.averageCost || cost);
      const incomingVal = quantity * cost;
      balance.averageCost = (currentVal + incomingVal) / newQty;
    }
    balance.lastCost = cost;
    balance.availableQty = newQty;
    balance.unitCost = cost;
    balance.stockValue = newQty * (balance.averageCost || cost);

    await balance.save({ session });

    // Section 14: Create immutable transaction ledger entry
    const txNumber = 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const ledgerEntry = new TransactionLedger({
      transactionNumber: txNumber,
      hospitalId,
      productId: product._id,
      productName: product.name,
      warehouseId,
      warehouseName,
      locationId,
      locationCode,
      batchId,
      batchNumber,
      serialNumberId,
      serialNumber,
      transactionType,
      referenceType,
      referenceId,
      quantity,
      unitCost: cost,
      totalCost: Math.abs(quantity) * cost,
      balanceAfter: newQty,
      reason: reason || `${transactionType} operation`,
      performedBy,
      approvedBy,
      metadata
    });

    await ledgerEntry.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { balance, ledgerEntry };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Section 14 Rule: Create Reversal Transaction for Ledger Corrections
 */
const recordReversalTransaction = async ({ originalTxNumber, reason, performedBy }) => {
  const originalTx = await TransactionLedger.findOne({ transactionNumber: originalTxNumber });
  if (!originalTx) throw new Error(`Original transaction ${originalTxNumber} not found.`);

  return await recordStockTransaction({
    hospitalId: originalTx.hospitalId,
    productId: originalTx.productId,
    warehouseId: originalTx.warehouseId,
    warehouseName: originalTx.warehouseName,
    locationId: originalTx.locationId,
    batchId: originalTx.batchId,
    serialNumberId: originalTx.serialNumberId,
    transactionType: 'ADJUSTMENT_IN',
    referenceType: 'REVERSAL',
    referenceId: originalTx.transactionNumber,
    quantity: -originalTx.quantity, // Reversal flips the quantity sign!
    unitCost: originalTx.unitCost,
    reason: `REVERSAL of ${originalTx.transactionNumber}: ${reason || 'Correction'}`,
    performedBy: performedBy || 'System Admin'
  });
};

module.exports = { recordStockTransaction, recordReversalTransaction };
