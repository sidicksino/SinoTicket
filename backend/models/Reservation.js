const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReservationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    seat_id: { type: Schema.Types.ObjectId, ref: 'Seat' },
    expires_at: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Expired', 'Completed'], default: 'Active' },
  },
  { timestamps: true }
);

ReservationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', ReservationSchema);
