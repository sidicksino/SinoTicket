const mongoose = require('mongoose');
const { Schema } = mongoose;

const TicketSchema = new Schema(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
    category_id: { type: Schema.Types.ObjectId },
    attendee_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    seat_id: { type: Schema.Types.ObjectId, ref: 'Seat' },
    qr_code: String,
    status: { type: String, enum: ['Active', 'Used', 'Refunded'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', TicketSchema);
