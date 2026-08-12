/**
 * AuditService — append-only audit log writer
 * Must NEVER update or delete existing audit records
 */
const AuditLog = require('../models/AuditLog');

async function log({
  userId, role, hospitalId, action, resource, resourceId,
  oldValues = null, newValues = null,
  ipAddress = '', userAgent = '', reason = '', requestId = ''
}) {
  try {
    await AuditLog.create({
      userId,
      role,
      hospitalId,
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      reason,
      requestId,
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit failure must not break main flow
    console.error('[AuditService] Failed to write audit log:', err.message);
  }
}

// Common action constants
const ACTIONS = {
  PRODUCT_CREATED:    'PRODUCT_CREATED',
  PRODUCT_UPDATED:    'PRODUCT_UPDATED',
  PRODUCT_DELETED:    'PRODUCT_DELETED',
  STOCK_RECEIVED:     'STOCK_RECEIVED',
  STOCK_ISSUED:       'STOCK_ISSUED',
  STOCK_TRANSFERRED:  'STOCK_TRANSFERRED',
  STOCK_ADJUSTED:     'STOCK_ADJUSTED',
  STOCK_RETURNED:     'STOCK_RETURNED',
  STOCK_COUNTED:      'STOCK_COUNTED',
  BATCH_BLOCKED:      'BATCH_BLOCKED',
  BATCH_RELEASED:     'BATCH_RELEASED',
  RECALL_CREATED:     'RECALL_CREATED',
  RECALL_CLOSED:      'RECALL_CLOSED',
  PO_CREATED:         'PO_CREATED',
  PO_APPROVED:        'PO_APPROVED',
  PO_CANCELLED:       'PO_CANCELLED',
  GRN_POSTED:         'GRN_POSTED',
  INDENT_APPROVED:    'INDENT_APPROVED',
  INDENT_ISSUED:      'INDENT_ISSUED',
  USER_CREATED:       'USER_CREATED',
  USER_ROLE_CHANGED:  'USER_ROLE_CHANGED',
  LOGIN:              'LOGIN',
  LOGOUT:             'LOGOUT',
  CONTROLLED_DRUG:    'CONTROLLED_DRUG_DISPENSED',
};

module.exports = { log, ACTIONS };
