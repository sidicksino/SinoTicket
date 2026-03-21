const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  profile_photo: {
    type: String,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
