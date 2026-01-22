import mongoose from 'mongoose';
import portfolioCategory from '../utils/constants/portfolio.category.js';
import { testimonialsMessages } from '../constants/index.js';

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
      enum: [
        portfolioCategory.designProgramming,
        portfolioCategory.marketing,
        portfolioCategory.print,
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Portfolio', PortfolioSchema);
