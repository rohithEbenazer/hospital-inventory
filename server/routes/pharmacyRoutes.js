const express = require('express');
const router = express.Router();
const Dispense = require('../models/Dispense');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const { recordStockTransaction } = require('../services/ledgerService');
const AuditLog = require('../models/AuditLog');

// Get all dispensing records
router.get('/dispense', async (req, res, next) => {
  try {
    const dispenses = await Dispense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: dispenses });
  } catch (err) {
    next(err);
  }
});

// Process Pharmacy Dispense
router.post('/dispense', async (req, res, next) => {
  try {
    const { patientId, patientName, doctorName, prescriptionId, items, controlledDrugVerified } = req.body;

    const dispenseNo = 'DISP-2026-' + Math.floor(1000 + Math.random() * 9000);
    let totalBillAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Find best batch for dispensing
      const batch = await Batch.findOne({
        productId: item.productId,
        batchNumber: item.batchNumber
      }) || await Batch.findOne({ productId: item.productId, status: 'AVAILABLE' }).sort({ expiryDate: 1 });

      const batchNo = batch ? batch.batchNumber : 'BAT-GENERIC';
      const unitCost = batch ? batch.unitCost : product.unitCost;
      const mrp = batch ? batch.mrp : product.mrp;
      const lineTotal = item.quantity * mrp;

      totalBillAmount += lineTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        batchNumber: batchNo,
        expiryDate: batch ? batch.expiryDate : new Date(),
        quantity: item.quantity,
        unitCost,
        mrp,
        totalAmount: lineTotal
      });

      // Deduct stock from batch
      if (batch) {
        batch.currentQuantity = Math.max(0, batch.currentQuantity - item.quantity);
        if (batch.currentQuantity === 0) batch.status = 'EMPTY';
        await batch.save();
      }

      // Record transaction ledger entry
      await recordStockTransaction({
        productId: product._id,
        warehouseName: 'Pharmacy Store',
        batchNumber: batchNo,
        transactionType: 'PHARMACY_DISPENSE',
        referenceType: 'DISPENSE',
        referenceId: dispenseNo,
        quantity: -item.quantity,
        unitCost,
        reason: `Pharmacy dispensing for Patient ${patientName} (${patientId})`,
        performedBy: req.user?.fullName || 'Pharmacist'
      });
    }

    const dispense = new Dispense({
      dispenseNumber: dispenseNo,
      patientId,
      patientName,
      doctorName,
      prescriptionId,
      pharmacistName: req.user?.fullName || 'Senior Pharmacist',
      items: processedItems,
      totalBillAmount,
      controlledDrugVerified: !!controlledDrugVerified
    });

    await dispense.save();

    await AuditLog.create({
      action: 'MEDICINE_DISPENSED',
      module: 'PHARMACY',
      performedBy: req.user?.fullName || 'Pharmacist',
      userRole: req.user?.role || 'PHARMACIST',
      details: `Dispensed medicines worth ₹${totalBillAmount} to ${patientName} (${dispenseNo})`
    });

    res.status(201).json({ success: true, data: dispense });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
