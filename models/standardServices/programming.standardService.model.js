import mongoose from 'mongoose';
import { StandardServiceMessages } from '../../constants/index.js';

const ProgrammingStandardServiceSchema = new mongoose.Schema(
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
    author: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ProgrammingStandardService', ProgrammingStandardServiceSchema);
