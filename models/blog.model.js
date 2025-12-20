const mongoose = require('mongoose');
const { blogsMessages } = require('../constants');

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

module.exports = mongoose.model('Blog', blogSchema);
