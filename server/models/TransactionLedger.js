const mongoose = require('mongoose');

const TransactionLedgerSchema = new mongoose.Schema({
  transactionNumber: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  warehouseName: { type: String, required: true },
  batchNumber: { type: String },
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
  referenceType: { type: String, default: 'SYSTEM' }, // e.g. PO, GRN, INDENT, DISPENSE
  referenceId: { type: String },
  quantity: { type: Number, required: true }, // Positive for additions, negative for deductions
  unitCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  balanceAfter: { type: Number, required: true },
  reason: { type: String },
  performedBy: { type: String, default: 'System Admin' },
  approvedBy: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TransactionLedger', TransactionLedgerSchema);
