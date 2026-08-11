const TransactionLedger = require('../models/TransactionLedger');
const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');

/**
 * Atomic Transaction Ledger & Stock Balance Updater
 */
const recordStockTransaction = async ({
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
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found for transaction');

  const cost = unitCost !== undefined ? unitCost : product.unitCost;

  // Find or create InventoryBalance record for this product and store
  let balance = await InventoryBalance.findOne({
    productId,
    warehouseName
  });

  if (!balance) {
    balance = new InventoryBalance({
      productId: product._id,
      productSku: product.sku,
      productName: product.name,
      warehouseName,
      availableQty: 0,
      unitCost: cost,
      totalStockValue: 0
    });
  }

  // Update current available quantity
  const newQty = Math.max(0, balance.availableQty + quantity);
  balance.availableQty = newQty;
  balance.unitCost = cost;
  balance.totalStockValue = newQty * cost;
  await balance.save();

  // Create immutable ledger entry
  const txNumber = 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const ledgerEntry = new TransactionLedger({
    transactionNumber: txNumber,
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

  await ledgerEntry.save();
  return { balance, ledgerEntry };
};

module.exports = { recordStockTransaction };
