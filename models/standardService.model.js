const mongoose = require('mongoose');

const standardServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    priceEgypt: {
      type: Number,
      required: true,
    },
    priceSaudi: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StandardService', standardServiceSchema);
