const mongoose = require('mongoose');
const { Schema } = mongoose;

const SeatSchema = new Schema(
  {
    section_id: { type: Schema.Types.ObjectId, ref: 'Section', index: true, required: true },
    number: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['available', 'reserved', 'booked'], 
      default: 'available',
      index: true 
    },
    reserved_until: { type: Date },
    current_ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', default: null },
  },
  { timestamps: true }
);

// 🔥 UNIQUE CONSTRAINT: Prevent duplicate seat numbers in the same section
SeatSchema.index({ section_id: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Seat', SeatSchema);
