const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Blogs = require('../models/blog.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const formatDate = require('../utils/format.date');
const userRole = require('../utils/user.roles');
const { blogsMessages } = require('../constants');

const addOneBlog = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.writer) {
    throw CustomError.create(400, blogsMessages.notAddAccessibility);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { title, description, image, category, content } = req.body;
  const date = formatDate();
  const author = req.user.id;

  const blog = await Blogs.create({ title, description, image, category, content, date, author });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
    message: blogsMessages.blogAddSuccess,
  });
});

const getAllBlogs = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const blogs = await Blogs.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Blogs.countDocuments(filter);

  if (blogs.length === 0) {
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        blogs: [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneBlog = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, blogsMessages.invalidBlogId);
  }

  const blog = await Blogs.findById(id, { __v: false });

  if (!blog) {
    throw CustomError.create(404, blogsMessages.blogNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
  });
});

const deleteOneBlog = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, blogsMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, blogsMessages.invalidBlogId);
  }

  const result = await Blogs.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, blogsMessages.blogNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: blogsMessages.deleteSuccess,
  });
});

const updateBlog = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const blog = await Blogs.findById(id);
  if (blog.author !== req.user.id) {
    throw CustomError.create(400, blogsMessages.notUpdataAccessibility);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, blogsMessages.invalidBlogId);
  }

  if (!blog) {
    throw CustomError.create(404, blogsMessages.blogNotFound);
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key].length > 0) {
      blog[key] = req.body[key];
    }
  });

  await blog.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
    message: blogsMessages.updateSuccess,
  });
});

module.exports = {
  getAllBlogs,
  getOneBlog,
  addOneBlog,
  deleteOneBlog,
  updateBlog,
};
