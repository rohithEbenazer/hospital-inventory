const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate, requireRole } = require('../middleware/auth');
const auditService = require('../services/auditService');

// GET all users (admin only)
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 25, search, role } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;

    const [data, total] = await Promise.all([
      User.find(filter).select('-password').sort({ name: 1 }).skip((+page - 1) * +limit).limit(+limit),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create user (admin only)
router.post('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, departmentId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'name, email, password, role are required' });
    }
    const exists = await User.findOne({ email, hospitalId: req.user.hospitalId });
    if (exists) return res.status(409).json({ success: false, message: 'Email already in use', code: 'EMAIL_EXISTS' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email, role, departmentId,
      hospitalId: req.user.hospitalId,
      password: hashedPassword,
    });

    await auditService.log({
      userId: req.user.id, role: req.user.role, hospitalId: req.user.hospitalId,
      action: auditService.ACTIONS.USER_CREATED,
      resource: 'User', resourceId: user._id,
      newValues: { name, email, role },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'User created', data: { _id: user._id, name, email, role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update user role
router.patch('/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const old = await User.findOne({ _id: req.params.id, hospitalId: req.user.hospitalId }).select('-password');
    if (!old) return res.status(404).json({ success: false, message: 'User not found' });

    const update = {};
    if (role) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password');

    await auditService.log({
      userId: req.user.id, role: req.user.role, hospitalId: req.user.hospitalId,
      action: auditService.ACTIONS.USER_ROLE_CHANGED,
      resource: 'User', resourceId: req.params.id,
      oldValues: { role: old.role }, newValues: update,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'User updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE user (admin only)
router.delete('/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await User.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET audit logs
router.get('/audit-logs', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const { page = 1, limit = 50, action, resource, startDate, endDate } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
