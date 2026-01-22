import mongoose from 'mongoose';
import validator from 'validator';
import { userMessages } from '../constants/index.js';

const contactSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: [true, userMessages.subjectRequired],
  },
  massage: {
    type: String,
    required: [true, userMessages.massageRequired],
  },
});

export default mongoose.model('Contact', contactSchema);
