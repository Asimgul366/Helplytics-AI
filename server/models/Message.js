const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

MessageSchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
