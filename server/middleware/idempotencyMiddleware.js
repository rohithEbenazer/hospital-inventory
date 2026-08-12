const idempotencyCache = new Map();

// Clean up keys older than 24 hours
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > 86400000) {
      idempotencyCache.delete(key);
    }
  }
}, 3600000);

const requireIdempotency = (req, res, next) => {
  const key = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  
  if (!key) {
    // If no key provided, allow request to proceed normally
    return next();
  }

  const cacheKey = `${req.user?.hospitalId || 'GLOBAL'}:${key}`;
  const existing = idempotencyCache.get(cacheKey);

  if (existing) {
    if (existing.status === 'PROCESSING') {
      return res.status(409).json({
        success: false,
        code: 'CONCURRENT_REQUEST',
        message: 'A request with this Idempotency-Key is currently processing. Please wait.'
      });
    }
    
    // Return cached response
    return res.status(existing.statusCode).json(existing.body);
  }

  // Mark as processing
  idempotencyCache.set(cacheKey, { status: 'PROCESSING', timestamp: Date.now() });

  // Intercept json response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    idempotencyCache.set(cacheKey, {
      status: 'COMPLETED',
      statusCode: res.statusCode,
      body,
      timestamp: Date.now()
    });
    return originalJson(body);
  };

  next();
};

module.exports = { requireIdempotency };
