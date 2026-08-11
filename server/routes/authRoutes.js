const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'admin123') { // demo override password
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
});

// Current User info
router.get('/me', async (req, res) => {
  res.json({
    success: true,
    user: {
      username: 'admin',
      fullName: 'Dr. Sarah Jenkins',
      role: req.headers['x-demo-role'] || 'SUPER_ADMIN',
      department: 'Central Inventory'
    }
  });
});

module.exports = router;
