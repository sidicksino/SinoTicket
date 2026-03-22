const mongoose = require('mongoose');
const { Schema } = mongoose;

const SeatSchema = new Schema(
  {
    section_id: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    number: Number,
    status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available' },
    current_ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seat', SeatSchema);
