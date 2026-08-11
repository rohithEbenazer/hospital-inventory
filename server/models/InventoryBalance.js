const mongoose = require('mongoose');

const InventoryBalanceSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  warehouseName: { type: String, required: true },
  availableQty: { type: Number, default: 0 },
  reservedQty: { type: Number, default: 0 },
  allocatedQty: { type: Number, default: 0 },
  inTransitQty: { type: Number, default: 0 },
  damagedQty: { type: Number, default: 0 },
  quarantinedQty: { type: Number, default: 0 },
  expiredQty: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  totalStockValue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InventoryBalance', InventoryBalanceSchema);
