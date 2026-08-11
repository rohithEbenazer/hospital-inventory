const express = require('express');
const router = express.Router();
const Indent = require('../models/Indent');
const Batch = require('../models/Batch');
const { allocateStockFEFO } = require('../services/fefoEngine');
const { recordStockTransaction } = require('../services/ledgerService');
const AuditLog = require('../models/AuditLog');

// Get all indents
router.get('/', async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.departmentName = department;

    const indents = await Indent.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: indents });
  } catch (err) {
    next(err);
  }
});

// Create new Department Indent request
router.post('/', async (req, res, next) => {
  try {
    const indentData = req.body;
    if (!indentData.indentNumber) {
      indentData.indentNumber = 'IND-2026-' + Math.floor(1000 + Math.random() * 9000);
    }
    const indent = new Indent(indentData);
    await indent.save();

    await AuditLog.create({
      action: 'INDENT_CREATED',
      module: 'INDENT',
      performedBy: indent.requestedBy,
      userRole: 'NURSE',
      details: `Created Department Indent ${indent.indentNumber} for ${indent.departmentName}`
    });

    res.status(201).json({ success: true, data: indent });
  } catch (err) {
    next(err);
  }
});

// Approve & Issue Department Indent using FEFO Engine
router.post('/:id/approve-issue', async (req, res, next) => {
  try {
    const indent = await Indent.findById(req.params.id);
    if (!indent) return res.status(404).json({ success: false, message: 'Indent not found' });

    if (indent.status === 'FULFILLED') {
      return res.status(400).json({ success: false, message: 'Indent is already fulfilled' });
    }

    indent.approvedBy = req.user?.fullName || 'Store Manager';

    // Fulfill each requested item using FEFO
    for (const item of indent.items) {
      const neededQty = item.requestedQty - item.issuedQty;
      if (neededQty <= 0) continue;

      const fefoResult = await allocateStockFEFO(item.productId, neededQty);

      for (const alloc of fefoResult.allocations) {
        // Deduct from batch
        await Batch.findByIdAndUpdate(alloc.batchId, {
          $inc: { currentQuantity: -alloc.allocatedQty }
        });

        // Record stock ledger transfer out
        await recordStockTransaction({
          productId: item.productId,
          warehouseName: 'Central Store',
          batchNumber: alloc.batchNumber,
          transactionType: 'ISSUE',
          referenceType: 'INDENT',
          referenceId: indent.indentNumber,
          quantity: -alloc.allocatedQty,
          reason: `Stock issue for Department Indent ${indent.indentNumber} (${indent.departmentName})`,
          performedBy: req.user?.fullName || 'Store Manager'
        });

        // Add allocation record to item
        item.batchAllocations.push({
          batchNumber: alloc.batchNumber,
          expiryDate: alloc.expiryDate,
          quantity: alloc.allocatedQty
        });

        item.issuedQty += alloc.allocatedQty;
      }
    }

    indent.status = 'FULFILLED';
    await indent.save();

    await AuditLog.create({
      action: 'INDENT_APPROVED_ISSUED',
      module: 'INDENT',
      performedBy: req.user?.fullName || 'Store Manager',
      userRole: req.user?.role || 'STORE_MANAGER',
      details: `Approved and Issued stock for Indent ${indent.indentNumber}`
    });

    res.json({ success: true, message: 'Indent approved and stock issued via FEFO', data: indent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
