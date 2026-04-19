const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'helper', 'both'], required: true },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  location: { type: String, trim: true, default: '' },
  trustScore: { type: Number, default: 0, min: 0 },
  badges: [{ type: String, enum: ['first-helper', 'rising-star', 'community-champion', 'legend'] }],
  solvedCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
