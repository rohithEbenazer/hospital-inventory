const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

// GET my notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25, unread } = req.query;
    const filter = {
      hospitalId: req.user.hospitalId,
      $or: [
        { recipientId: req.user.id },
        { recipientRole: req.user.role },
      ],
    };
    if (unread === 'true') filter.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);
    res.json({ success: true, data, meta: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit), unreadCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH mark as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    res.json({ success: true, data: n });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH mark all as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { hospitalId: req.user.hospitalId, $or: [{ recipientId: req.user.id }, { recipientRole: req.user.role }], isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      hospitalId: req.user.hospitalId,
      $or: [{ recipientId: req.user.id }, { recipientRole: req.user.role }],
      isRead: false,
    });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
