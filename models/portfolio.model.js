const mongoose = require('mongoose');
const { designProgramming, marketing, print } = require('../utils/portfolio.category');
const { testimonialsMessages } = require('../constants');

const PortfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, testimonialsMessages.titleIsRequire],
    },
    image: {
      type: String,
      required: [true, testimonialsMessages.imageIsRequire],
    },
    url: {
      type: String,
      required: [true, testimonialsMessages.urlIsRequire],
    },
    category: {
      type: String,
      required: [true, testimonialsMessages.categoryIsRequire],
      enum: [designProgramming, marketing, print],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Portfolio', PortfolioSchema);
