const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema(
  {
    title: String,
    description: String,
    imageUrl: { type: String, default: null },
    date: { type: Date, index: true },
    venue_id: { type: Schema.Types.ObjectId, ref: 'Venue', index: true },
    admin_id: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Ended'], default: 'Upcoming', index: true },
    artist_lineup: [{ name: String, time: String }],
    ticket_categories: [
      {
        category_id: { type: Schema.Types.ObjectId },
        name: String,
        price: Number,
        section_id: { type: Schema.Types.ObjectId, ref: 'Section' },
        quantity: Number,
        sold: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
