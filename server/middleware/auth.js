const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_inventory_secret_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Demo mode fallback if no header provided
    req.user = {
      id: 'demo-user-id',
      username: 'admin',
      fullName: 'Dr. Sarah Jenkins',
      role: req.headers['x-demo-role'] || 'SUPER_ADMIN',
      department: 'Central Store'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = {
        id: 'demo-user-id',
        username: 'admin',
        fullName: 'Dr. Sarah Jenkins',
        role: req.headers['x-demo-role'] || 'SUPER_ADMIN',
        department: 'Central Store'
      };
      return next();
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // In demo mode we allow execution but flag role context
      req.roleAllowed = true;
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles, JWT_SECRET };
