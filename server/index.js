const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

// Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Hospital Inventory & Supply Chain Management API',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Hospital Inventory API Server running on port ${PORT}`);
  });
});
