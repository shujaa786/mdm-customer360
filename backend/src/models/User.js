const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'DATA_STEWARD',
        'SOURCE_OPERATOR',
        'BUSINESS_USER'
      ],
      default: 'BUSINESS_USER'
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);