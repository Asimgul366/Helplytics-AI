const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');

// GET /api/users/stats (public)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResolved = await Request.countDocuments({ status: 'solved' });
    const activeHelpers = await User.countDocuments({ role: { $in: ['helper', 'both'] } });
    res.json({ totalUsers, totalResolved, activeHelpers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const helpers = await User.find({ role: { $in: ['helper', 'both'] } })
      .sort({ trustScore: -1 })
      .limit(20)
      .select('-password');
    res.json(helpers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  const { name, skills, interests, location } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, skills, interests, location },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
