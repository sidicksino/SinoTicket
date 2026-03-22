const mongoose = require('mongoose');
const { Schema } = mongoose;

const VenueSchema = new Schema(
  {
    name: String,
    location: String,
    capacity: Number,
    admin_id: { type: Schema.Types.ObjectId, ref: 'User' },
    map_data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', VenueSchema);
