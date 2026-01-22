import mongoose from 'mongoose';
import validator from 'validator';
import favoriteContact from '../utils/constants/favorite.contact.js';
import { userMessages } from '../constants/index.js';

const customServicesSchema = new mongoose.Schema(
  {
    idUser: {
      type: String,
    },
    name: {
      type: String,
      required: [true, userMessages.nameRequired],
    },
    companyName: {
      type: String,
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
          const hasDot = localPart.includes('.');
          return !hasDot;
        },
        message: userMessages.emailInvalid,
      },
    },
    phone: {
      type: String,
      required: [true, userMessages.phoneRequired],
    },
    whatsapp: {
      type: String,
      required: [true, userMessages.whatsappRequired],
    },
    favoriteContact: {
      type: String,
      required: [true, userMessages.favoriteContactRequired],
      enum: [favoriteContact.email, favoriteContact.phone, favoriteContact.whatsapp],
    },
    file: {
      type: String,
    },
    typeService: {
      type: String,
      required: [true, userMessages.typeServiceRequired],
    },
    serviceDetails: {
      type: String,
      required: [true, userMessages.serviceDetailsRequired],
    },
    massage: {
      type: String,
      required: [true, userMessages.massageRequired],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('customServices', customServicesSchema);
