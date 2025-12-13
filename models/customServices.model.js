const mongoose = require('mongoose');
const validator = require('validator');
const favoriteContact = require('../utils/favorite.contact');

const customServicesSchema = new mongoose.Schema(
  {
    idUser: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          const isGmail = validator.isEmail(v) && v.toLowerCase().endsWith('@gmail.com');
          if (!isGmail) return false;
          const localPart = v.split('@')[0];
          const hasDot = localPart.includes('.');
          return !hasDot;
        },
        message: 'Email must be a valid Gmail address without any dots before @',
      },
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    favoriteContact: {
      type: String,
      required: true,
      enum: [favoriteContact.email, favoriteContact.phone, favoriteContact.whatsapp],
    },
    file: {
      type: String,
    },
    typeService: {
      type: String,
      required: true,
    },
    serviceDetails: {
      type: String,
      required: true,
    },
    massage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('customServices', customServicesSchema);
