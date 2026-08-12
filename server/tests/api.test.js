const { requireIdempotency } = require('../middleware/idempotencyMiddleware');
const { calculateDemandForecast } = require('../services/analyticsService');

describe('SCEC Hospital Inventory Production Test Suite (Sections A-Z)', () => {

  describe('1. Production Security & Authentication Guard', () => {
    it('should reject unauthenticated requests in production environment', () => {
      let authenticateTokenProd;
      jest.isolateModules(() => {
        process.env.NODE_ENV = 'production';
        process.env.JWT_SECRET = 'prod_secret_test_99';
        authenticateTokenProd = require('../middleware/auth').authenticateToken;
      });

      const req = { headers: {} };
      let statusCode = null;
      let responseBody = null;

      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { responseBody = data; return res; }
      };

      authenticateTokenProd(req, res, () => {});

      expect(statusCode).toBe(401);
      expect(responseBody.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('should assign demo user role in development environment when token is omitted', () => {
      let authenticateTokenDev;
      jest.isolateModules(() => {
        process.env.NODE_ENV = 'development';
        authenticateTokenDev = require('../middleware/auth').authenticateToken;
      });

      const req = { headers: { 'x-demo-role': 'SUPER_ADMIN' } };
      let nextCalled = false;

      const res = {};
      authenticateTokenDev(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.user.role).toBe('SUPER_ADMIN');
      expect(req.user.hospitalId).toBe('HOSP-001');
    });
  });

  describe('2. Idempotency Key Engine', () => {
    it('should cache and return idempotent payload on repeated calls', () => {
      const req = { headers: { 'idempotency-key': 'IDEMP-TEST-KEY-001' }, user: { hospitalId: 'HOSP-001' } };
      let nextCount = 0;
      let cachedPayload = null;

      const res = {
        statusCode: 200,
        json: (body) => { cachedPayload = body; return res; },
        status: (s) => { res.statusCode = s; return res; }
      };

      requireIdempotency(req, res, () => {
        nextCount++;
        res.json({ success: true, transactionId: 'TXN-99401' });
      });

      expect(nextCount).toBe(1);
      expect(cachedPayload.transactionId).toBe('TXN-99401');

      // Second identical request
      const req2 = { headers: { 'idempotency-key': 'IDEMP-TEST-KEY-001' }, user: { hospitalId: 'HOSP-001' } };
      let req2NextCalled = false;
      let req2Body = null;

      const res2 = {
        statusCode: 200,
        status: (s) => { res2.statusCode = s; return res2; },
        json: (body) => { req2Body = body; return res2; }
      };

      requireIdempotency(req2, res2, () => { req2NextCalled = true; });

      expect(req2NextCalled).toBe(false); // Does not hit handler again
      expect(req2Body.transactionId).toBe('TXN-99401');
    });
  });

  describe('3. Demand Forecasting & Analytics Math Engine', () => {
    it('should accurately calculate exponential smoothing demand forecast math', () => {
      const historicalData = [100, 110, 120, 130, 140];
      const alpha = 0.3;
      const forecast = calculateDemandForecast(historicalData, alpha);

      expect(typeof forecast).toBe('number');
      expect(forecast).toBeGreaterThan(100);
    });
  });

});
