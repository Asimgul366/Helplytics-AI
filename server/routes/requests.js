const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');

const computeBadges = (solvedCount) => {
  const badges = [];
  if (solvedCount >= 1) badges.push('first-helper');
  if (solvedCount >= 10) badges.push('rising-star');
  if (solvedCount >= 50) badges.push('community-champion');
  if (solvedCount >= 100) badges.push('legend');
  return badges;
};

// GET /api/requests/recent
router.get('/recent', auth, async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name location');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/requests
router.get('/', auth, async (req, res) => {
  try {
    const { category, urgency, skills, location, page = 1 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      filter.tags = { $in: skillArr };
    }
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    const requests = await Request.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name location')
      .populate('helpers', 'name');
    const total = await Request.countDocuments(filter);
    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/requests
router.post('/', auth, async (req, res) => {
  const { title, description, category, tags, urgency, location } = req.body;
  if (!title || !description || !category || !urgency) {
    return res.status(400).json({ message: 'Title, description, category and urgency are required' });
  }
  try {
    const request = await Request.create({
      title, description, category, tags: tags || [], urgency, location: location || '',
      owner: req.user.id,
    });
    await request.populate('owner', 'name location');
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/requests/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('owner', 'name location skills trustScore badges')
      .populate('helpers', 'name skills trustScore badges');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/requests/:id/help
router.put('/:id/help', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status === 'solved') return res.status(400).json({ message: 'Request already solved' });
    if (request.helpers.includes(req.user.id)) return res.status(400).json({ message: 'Already helping' });
    if (request.owner.toString() === req.user.id) return res.status(400).json({ message: 'Cannot help your own request' });

    request.helpers.push(req.user.id);
    await request.save();

    // Notify owner
    await Notification.create({
      recipient: request.owner,
      type: 'match',
      message: `Someone offered to help on "${request.title}"`,
      relatedRequest: request._id,
    });

    await request.populate('helpers', 'name skills trustScore badges');
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/requests/:id/solve
router.put('/:id/solve', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (request.status === 'solved') return res.status(400).json({ message: 'Already solved' });

    request.status = 'solved';
    request.solvedAt = new Date();
    await request.save();

    // Increment helpers trust score
    for (const helperId of request.helpers) {
      const helper = await User.findById(helperId);
      if (helper) {
        helper.trustScore += 5;
        helper.solvedCount += 1;
        helper.badges = computeBadges(helper.solvedCount);
        await helper.save();
        await Notification.create({
          recipient: helperId,
          type: 'status',
          message: `"${request.title}" was marked as solved`,
          relatedRequest: request._id,
        });
      }
    }

    // Increment owner trust score
    const owner = await User.findById(req.user.id);
    if (owner) {
      owner.trustScore += 2;
      await owner.save();
      await Notification.create({
        recipient: owner._id,
        type: 'reputation',
        message: 'Your trust score increased after a solved request',
        relatedRequest: request._id,
      });
    }

    await request.populate('owner', 'name location skills trustScore badges');
    await request.populate('helpers', 'name skills trustScore badges');
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
