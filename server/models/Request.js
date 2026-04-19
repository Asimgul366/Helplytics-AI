const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  urgency: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['open', 'solved'], default: 'open' },
  location: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  solvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
