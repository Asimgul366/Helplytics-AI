const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('relatedRequest', 'title');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
