const mongoose = require('mongoose');
const { StandardServiceMessages } = require('../constants');

const standardServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, StandardServiceMessages.titleIsRequire],
      trim: true,
    },
    image: {
      type: String,
      required: [true, StandardServiceMessages.imageIsRequire],
    },
    priceEgypt: {
      type: Number,
      required: [true, StandardServiceMessages.priceEgypt],
    },
    priceSaudi: {
      type: Number,
      required: [true, StandardServiceMessages.priceSaudi],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StandardService', standardServiceSchema);
