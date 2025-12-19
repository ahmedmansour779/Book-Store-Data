const mongoose = require('mongoose');
const validator = require('validator');
const { userMessages } = require('../constants');

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

module.exports = mongoose.model('Contact', contactSchema);
