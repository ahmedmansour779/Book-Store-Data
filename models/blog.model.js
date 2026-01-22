import mongoose from 'mongoose';
import { blogsMessages } from '../constants/index.js';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, blogsMessages.titleIsRequire],
    },
    description: {
      type: String,
      required: [true, blogsMessages.descriptionIsRequire],
    },
    image: {
      type: String,
      required: [true, blogsMessages.imageIsRequire],
    },
    date: {
      type: String,
    },
    category: {
      type: String,
      required: [true, blogsMessages.categoryIsRequire],
    },
    content: {
      type: String,
      required: [true, blogsMessages.contentIsRequire],
    },
    author: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Blog', blogSchema);
