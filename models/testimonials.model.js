import mongoose from 'mongoose';
import { testimonialsMessages } from '../constants/index.js';

const ratingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, testimonialsMessages.titleIsRequire],
    },
    description: {
      type: String,
      required: [true, testimonialsMessages.descriptionIsRequire],
    },
    jobDescription: {
      type: String,
      required: [true, testimonialsMessages.jobDescriptionIsRequire],
    },
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
      required: [true, testimonialsMessages.ratingIsRequire],
    },
    image: {
      type: String,
      required: [true, testimonialsMessages.imageIsRequire],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('rating', ratingSchema);
