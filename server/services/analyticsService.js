const InventoryBalance = require('../models/InventoryBalance');
const Product = require('../models/Product');

/**
 * ABC Analysis:
 * Category A: Top 70% of total inventory value
 * Category B: Next 20% of total inventory value
 * Category C: Bottom 10% of total inventory value
 */
const calculateABCAnalysis = async (hospitalId) => {
  const balances = await InventoryBalance.find({ hospitalId }).populate('productId');
  
  const itemsWithValue = balances.map(b => {
    const cost = b.unitCost || 100;
    const value = (b.totalQuantity || 0) * cost;
    return {
      productId: b.productId?._id,
      productName: b.productId?.name || 'Medical Consumable',
      sku: b.productId?.sku || 'SKU-000',
      totalQuantity: b.totalQuantity,
      unitCost: cost,
      totalValue: value
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  const grandTotalValue = itemsWithValue.reduce((acc, item) => acc + item.totalValue, 0) || 1;
  let runningCumulative = 0;

  const abcResult = itemsWithValue.map(item => {
    runningCumulative += item.totalValue;
    const cumulativePct = (runningCumulative / grandTotalValue) * 100;
    
    let category = 'C';
    if (cumulativePct <= 70) category = 'A';
    else if (cumulativePct <= 90) category = 'B';

    return { ...item, category, cumulativePct: cumulativePct.toFixed(2) };
  });

  return abcResult;
};

/**
 * Exponential Smoothing Demand Forecasting Engine:
 * Forecast_t+1 = alpha * Actual_t + (1 - alpha) * Forecast_t
 */
const calculateDemandForecast = (history = [120, 135, 140, 150, 160], alpha = 0.3) => {
  if (history.length === 0) return 100;
  let forecast = history[0];
  for (let i = 1; i < history.length; i++) {
    forecast = alpha * history[i] + (1 - alpha) * forecast;
  }
  return Math.round(forecast);
};

module.exports = { calculateABCAnalysis, calculateDemandForecast };
