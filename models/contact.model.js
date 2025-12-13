const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true,
  },
  massage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Contact', contactSchema);
