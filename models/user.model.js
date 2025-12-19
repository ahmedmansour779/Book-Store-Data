const mongoose = require('mongoose');
const validator = require('validator');
const favoriteContact = require('../utils/favorite.contact');
const { userMessages } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, userMessages.nameRequired],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, userMessages.phoneRequired],
    },
    whatsapp: {
      type: String,
      required: [true, userMessages.whatsappRequired],
    },
    email: {
      type: String,
      required: [true, userMessages.emailRequired],
      unique: true,
      validate: {
        validator: function (v) {
          const isGmail = validator.isEmail(v) && v.toLowerCase().endsWith('@gmail.com');
          if (!isGmail) return false;
          const localPart = v.split('@')[0];
          return !localPart.includes('.');
        },
        message: userMessages.emailInvalid,
      },
    },
    password: {
      type: String,
      required: [true, userMessages.passwordRequired],
      minlength: [8, userMessages.passwordMinLength],
    },
    favoriteContact: {
      type: String,
      required: [true, userMessages.favoriteContactRequired],
      enum: {
        values: [favoriteContact.email, favoriteContact.phone, favoriteContact.whatsapp],
        message: userMessages.favoriteContactInvalid,
      },
    },
    companyName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
