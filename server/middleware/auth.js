const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_inventory_secret_key_2026';

// Role permission mapping matrix
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  HOSPITAL_ADMIN: ['*'],
  INVENTORY_ADMIN: ['inventory.*', 'stores.*', 'reports.*', 'audit.*'],
  STORE_MANAGER: ['inventory.*', 'stores.*', 'indents.approve', 'transfers.*', 'grn.*', 'stock.*'],
  STORE_KEEPER: ['inventory.view', 'grn.create', 'indents.issue', 'transfers.receive', 'stock_count.enter'],
  PURCHASE_MANAGER: ['procurement.*', 'suppliers.*', 'po.*', 'rfq.*'],
  PROCUREMENT_OFFICER: ['pr.view', 'rfq.create', 'po.create', 'suppliers.view'],
  PHARMACY_MANAGER: ['pharmacy.*', 'controlled_drugs.*', 'stock.view'],
  PHARMACIST: ['pharmacy.dispense', 'pharmacy.return', 'stock.view', 'controlled_drugs.register'],
  DEPARTMENT_MANAGER: ['indents.create', 'indents.view', 'consumption.view'],
  NURSE: ['indents.create', 'consumption.record'],
  AUDITOR: ['audit.view', 'reports.view', 'ledger.view'],
  REPORT_VIEWER: ['reports.view']
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Also check x-demo-role header for role simulator UI testing if token not supplied
  if (!token) {
    const demoRole = req.headers['x-demo-role'] || 'SUPER_ADMIN';
    req.user = {
      id: 'usr-demo-001',
      username: 'admin',
      fullName: 'Dr. Sarah Jenkins',
      role: demoRole,
      department: 'Central Store',
      hospitalId: 'HOSP-001'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
    req.user = {
      ...decoded,
      hospitalId: decoded.hospitalId || 'HOSP-001'
    };
    next();
  });
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    
    // Super Admin bypasses role checks
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'HOSPITAL_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this operation.`
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET };
