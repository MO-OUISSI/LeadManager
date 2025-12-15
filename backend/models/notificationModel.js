const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  dateNotification: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['lead', 'meeting', 'status', 'system'],
    default: 'system',
  },
  statut: {
    type: Boolean,
    default: false, 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
