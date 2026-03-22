const mongoose = require('mongoose');
const { Schema } = mongoose;

const SectionSchema = new Schema(
  {
    venue_id: { 
      type: Schema.Types.ObjectId, 
      ref: 'Venue', 
      required: true, 
      index: true 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 100 
    },
    description: { 
      type: String, 
      maxlength: 500 
    },
    parent_section_id: { 
      type: Schema.Types.ObjectId, 
      ref: 'Section', 
      default: null, 
      index: true 
    },
  },
  { timestamps: true }
);

// 🔥 UNIQUE CONSTRAINT: Prevent duplicate section names in the same venue
SectionSchema.index({ venue_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', SectionSchema);
