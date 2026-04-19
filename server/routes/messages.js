const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Request = require('../models/Request');

// GET /api/messages/threads
router.get('/threads', auth, async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ owner: req.user.id }, { helpers: req.user.id }]
    }).populate('owner', 'name').populate('helpers', 'name');

    const threads = await Promise.all(requests.map(async (r) => {
      const lastMsg = await Message.findOne({ request: r._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');
      return { request: r, lastMessage: lastMsg };
    }));

    res.json(threads.filter(t => t.lastMessage));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/:requestId
router.get('/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isOwner = request.owner.toString() === req.user.id;
    const isHelper = request.helpers.map(h => h.toString()).includes(req.user.id);
    if (!isOwner && !isHelper) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ request: req.params.requestId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages/:requestId
router.post('/:requestId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isOwner = request.owner.toString() === req.user.id;
    const isHelper = request.helpers.map(h => h.toString()).includes(req.user.id);
    if (!isOwner && !isHelper) return res.status(403).json({ message: 'Not authorized' });

    const message = await Message.create({
      request: req.params.requestId,
      sender: req.user.id,
      content: content.trim(),
    });
    await message.populate('sender', 'name');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
