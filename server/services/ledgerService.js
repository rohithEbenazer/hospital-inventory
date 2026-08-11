const mongoose = require('mongoose');
const TransactionLedger = require('../models/TransactionLedger');
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');

/**
 * Atomic Transaction Ledger & Stock Balance Updater
 * Enforces ZERO NEGATIVE STOCK validation and atomic session updates.
 */
const recordStockTransaction = async ({
  hospitalId = 'HOSP-001',
  productId,
  warehouseName,
  batchNumber,
  transactionType,
  referenceType = 'SYSTEM',
  referenceId = 'REF-001',
  quantity, // positive for stock IN, negative for stock OUT
  unitCost,
  reason,
  performedBy = 'System Admin',
  approvedBy
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findOne({ _id: productId, hospitalId }).session(session);
    if (!product) throw new Error(`Product ${productId} not found for hospital ${hospitalId}`);

    const cost = unitCost !== undefined ? unitCost : product.unitCost;

    // Find or create InventoryBalance record for this product and store
    let balance = await InventoryBalance.findOne({
      hospitalId,
      productId,
      warehouseName
    }).session(session);

    if (!balance) {
      if (quantity < 0) {
        throw new Error(`INSUFFICIENT_STOCK: Cannot issue ${Math.abs(quantity)} units. Current stock is 0.`);
      }
      balance = new InventoryBalance({
        hospitalId,
        productId: product._id,
        productSku: product.sku,
        productName: product.name,
        warehouseName,
        availableQty: 0,
        unitCost: cost,
        totalStockValue: 0
      });
    }

    // STRICT VALIDATION: Reject any operation that results in negative stock balance!
    const newQty = balance.availableQty + quantity;
    if (newQty < 0) {
      throw new Error(`INSUFFICIENT_STOCK: Cannot deduct ${Math.abs(quantity)} units of ${product.name}. Available stock in ${warehouseName} is only ${balance.availableQty} units.`);
    }

    balance.availableQty = newQty;
    balance.unitCost = cost;
    balance.totalStockValue = newQty * cost;
    await balance.save({ session });

    // Create immutable transaction ledger entry
    const txNumber = 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const ledgerEntry = new TransactionLedger({
      transactionNumber: txNumber,
      hospitalId,
      productId: product._id,
      productName: product.name,
      warehouseName,
      batchNumber,
      transactionType,
      referenceType,
      referenceId,
      quantity,
      unitCost: cost,
      totalCost: Math.abs(quantity) * cost,
      balanceAfter: newQty,
      reason: reason || `${transactionType} operation`,
      performedBy,
      approvedBy
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

module.exports = { recordStockTransaction };
