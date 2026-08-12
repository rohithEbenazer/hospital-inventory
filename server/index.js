const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Security Middleware Stack
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));
app.use(express.json({ limit: '10mb' }));

const { startExpiryAlertJob } = require('./jobs/expiryAlertJob');
const { startLowStockJob } = require('./jobs/lowStockJob');

// Standardized /api/v1 Route Mounts
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1', require('./routes/categoryRoutes'));
app.use('/api/v1/stores', require('./routes/warehouseRoutes'));
app.use('/api/v1/stock', require('./routes/stockRoutes'));
app.use('/api/v1/procurement', require('./routes/procurementRoutes'));
app.use('/api/v1/indents', require('./routes/indentRoutes'));
app.use('/api/v1/transfers', require('./routes/transferRoutes'));
app.use('/api/v1/stock-counts', require('./routes/stockCountRoutes'));
app.use('/api/v1/recalls', require('./routes/recallRoutes'));
app.use('/api/v1/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/v1/assets', require('./routes/assetRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/departments', require('./routes/departmentRoutes'));
app.use('/api/v1/locations', require('./routes/locationRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/patients', require('./routes/patientRoutes'));
app.use('/api/v1/suppliers', require('./routes/supplierRoutes'));
app.use('/api/v1/system300', require('./routes/admin300Routes'));
app.use('/api/v1/ops', require('./routes/opsRoutes'));

// Legacy endpoint backward compatibility aliases
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api', require('./routes/categoryRoutes'));
app.use('/api/stores', require('./routes/warehouseRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/procurement', require('./routes/procurementRoutes'));
app.use('/api/indents', require('./routes/indentRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/system300', require('./routes/admin300Routes'));
app.use('/api/ops', require('./routes/opsRoutes'));

// Root Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SCEC Hospital Inventory & Supply Chain Management Production API',
    version: '1.0.0-PROD',
    timestamp: new Date()
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedDatabase();
  startExpiryAlertJob();
  startLowStockJob();
  app.listen(PORT, () => {
    console.log(`SCEC Hospital Inventory API Server running on port ${PORT}`);
  });
});
