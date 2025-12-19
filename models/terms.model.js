const mongoose = require('mongoose');
const { termsMessages } = require('../constants');

const termsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, termsMessages.titleIsRequire],
    },
    items: {
      type: [String],
      required: [true, termsMessages.itemsIsRequire],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Term', termsSchema);
