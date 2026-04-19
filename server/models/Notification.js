const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['match', 'status', 'request', 'reputation'], required: true },
  message: { type: String, required: true },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
