const mongoose = require('mongoose');
const { Schema } = mongoose;

const SectionSchema = new Schema(
  {
    venue_id: { type: Schema.Types.ObjectId, ref: 'Venue' },
    name: String,
    description: String,
    parent_section_id: { type: Schema.Types.ObjectId, ref: 'Section', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Section', SectionSchema);
