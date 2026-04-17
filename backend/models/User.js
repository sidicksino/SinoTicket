const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    profile_photo: { type: String, default: null },
    phone_number: { type: String, default: null },
    preferences: { type: Schema.Types.Mixed, default: {} },
    is_verified: { type: Boolean, default: false },
    push_tokens: [{ type: String }],
    last_login: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);