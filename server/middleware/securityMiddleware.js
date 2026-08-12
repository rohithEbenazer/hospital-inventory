// In-memory Rate Limiter & Security Header Middleware Stack
const rateLimitMap = new Map();

const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 1000 }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    let requestLogs = rateLimitMap.get(ip) || [];
    requestLogs = requestLogs.filter(timestamp => timestamp > windowStart);

    if (requestLogs.length >= options.max) {
      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Too many requests from this IP, please try again later.'
      });
    }

    requestLogs.push(now);
    rateLimitMap.set(ip, requestLogs);

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', options.max - requestLogs.length);
    next();
  };
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  next();
};

module.exports = { rateLimiter, securityHeaders };
