import mongoose from 'mongoose';
import { termsMessages } from '../constants/index.js';

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

export default mongoose.model('Term', termsSchema);
