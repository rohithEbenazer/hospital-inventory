const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
