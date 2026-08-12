/**
 * lowStockJob — runs every 4 hours
 * Checks all products against reorder points and triggers notifications
 */
const { checkLowStock } = require('../services/reorderService');
const mongoose = require('mongoose');

async function runLowStockJob() {
  try {
    console.log('[LowStockJob] Checking low stock...');
    // Get all distinct hospitalIds
    const User = require('../models/User');
    const hospitals = await User.distinct('hospitalId');
    for (const hospitalId of hospitals) {
      if (hospitalId) await checkLowStock(hospitalId);
    }
    console.log('[LowStockJob] Done.');
  } catch (err) {
    console.error('[LowStockJob] Error:', err.message);
  }
}

function startLowStockJob() {
  runLowStockJob(); // run immediately
  setInterval(runLowStockJob, 4 * 60 * 60 * 1000); // every 4 hours
}

module.exports = { startLowStockJob, runLowStockJob };
