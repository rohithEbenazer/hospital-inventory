const request = require('supertest');
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requireIdempotency } = require('../middleware/idempotencyMiddleware');
const { calculateDemandForecast } = require('../services/analyticsService');

describe('SCEC Hospital Inventory API Production Test Suite', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.get('/api/v1/test-auth', authenticateToken, (req, res) => res.json({ success: true, user: req.user }));
    app.post('/api/v1/test-idempotency', requireIdempotency, (req, res) => res.json({ success: true, timestamp: Date.now() }));
  });

  describe('1. Authentication & Production Guard', () => {
    it('should allow demo user in development mode when token is absent', async () => {
      process.env.NODE_ENV = 'development';
      const res = await request(app).get('/api/v1/test-auth');
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('SUPER_ADMIN');
    });

    it('should reject requests without token in production mode', async () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'prod_secret_test';
      const res = await request(app).get('/api/v1/test-auth');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTHENTICATION_REQUIRED');
    });
  });

  describe('2. Idempotency Engine', () => {
    it('should cache and return exact response for identical Idempotency-Key header', async () => {
      process.env.NODE_ENV = 'development';
      const key = 'IDEMP-TEST-998811';
      const res1 = await request(app).post('/api/v1/test-idempotency').set('idempotency-key', key);
      const res2 = await request(app).post('/api/v1/test-idempotency').set('idempotency-key', key);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.timestamp).toEqual(res2.body.timestamp);
    });
  });

  describe('3. Demand Forecasting Engine', () => {
    it('should calculate exponential smoothing demand forecast accurately', () => {
      const history = [100, 110, 120, 130];
      const forecast = calculateDemandForecast(history, 0.3);
      expect(forecast).toBeGreaterThan(100);
      expect(typeof forecast).toBe('number');
    });
  });
});
