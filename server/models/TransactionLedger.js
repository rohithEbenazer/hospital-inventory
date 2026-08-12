const mongoose = require('mongoose');

const TransactionLedgerSchema = new mongoose.Schema({
  transactionNumber:{ type: String, required: true, unique: true },
  hospitalId:       { type: mongoose.Schema.Types.Mixed, required: true, default: 'HOSP-001' },
  productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:      { type: String, required: true },
  warehouseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  warehouseName:    { type: String, required: true, default: 'Central Main Warehouse' },
  locationId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  locationCode:     { type: String },
  batchId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  batchNumber:      { type: String },
  serialNumberId:   { type: mongoose.Schema.Types.ObjectId, ref: 'SerialNumber' },
  serialNumber:     { type: String },
  transactionType: {
    type: String,
    enum: [
      'OPENING_BALANCE', 'PURCHASE_RECEIPT', 'ISSUE', 'TRANSFER_OUT',
      'TRANSFER_IN', 'SALES_RETURN', 'PURCHASE_RETURN', 'PATIENT_CONSUMPTION',
      'PHARMACY_DISPENSE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE',
      'EXPIRY', 'WRITE_OFF', 'RECALL', 'STOCK_COUNT'
    ],
    required: true
  },
  referenceType:    { type: String, default: 'SYSTEM' }, // e.g. PO, GRN, INDENT, DISPENSE, REVERSAL
  referenceId:      { type: String },
  quantity:         { type: Number, required: true }, // positive for addition, negative for deduction
  unitCost:         { type: Number, default: 0 },
  totalCost:        { type: Number, default: 0 },
  balanceAfter:     { type: Number, required: true },
  reason:           { type: String },
  performedBy:      { type: String, default: 'System Admin' },
  approvedBy:       { type: String },
  timestamp:        { type: Date, default: Date.now },
  metadata:         { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Section 14 Immutability Guard: Prevent direct modification or deletion of ledger entries
TransactionLedgerSchema.pre('updateOne', function () {
  throw new Error('IMMUTABLE_LEDGER_ERROR: Transaction ledger entries cannot be modified. Create a reversal transaction instead.');
});

TransactionLedgerSchema.pre('deleteOne', function () {
  throw new Error('IMMUTABLE_LEDGER_ERROR: Transaction ledger entries cannot be deleted. Create a reversal transaction instead.');
});

TransactionLedgerSchema.index({ hospitalId: 1, transactionNumber: 1 }, { unique: true });
TransactionLedgerSchema.index({ hospitalId: 1, productId: 1, createdAt: -1 });

module.exports = mongoose.model('TransactionLedger', TransactionLedgerSchema);
