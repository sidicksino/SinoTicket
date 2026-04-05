const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true }, // Clerk ID
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['SYSTEM', 'BOOKING', 'PROMO'], default: 'SYSTEM' },
    is_read: { type: Boolean, default: false },
    link: { type: String, default: null } // Optional deep link
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
