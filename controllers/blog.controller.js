const { validationResult } = require('express-validator');
const Blogs = require('../models/blog.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const formatDate = require('../utils/format.date');
const uploadImage = require('../utils/upload.Image');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');

const addOneBlog = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.writer) {
    throw CustomError.create(400, 'you can not add blog');
  }

  let image;
  if (req.file) {
    image = await uploadImage(req.file, 'blogs', req.body.title);
    req.body.image = image;
  }

  if (!req.body.image) {
    throw CustomError.create(400, 'image is required');
  }

  if (!req.body.date) {
    req.body.date = formatDate();
  }

  req.body.author = req.user.data._id;

  const blog = await Blogs.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
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
    throw CustomError.create(404, 'No blogs found');
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
    throw CustomError.create(400, 'Invalid blog id');
  }

  const blog = await Blogs.findById(id, { __v: false });

  if (!blog) {
    throw CustomError.create(404, 'blog not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
  });
});

const deleteOneBlog = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete blog');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid blog id');
  }

  const result = await Blogs.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'blog not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

const updateBlog = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const blog = await Blogs.findById(id);
  if (!blog) {
    throw CustomError.create(404, 'Blog not found');
  }

  if (!mongoose.Types.ObjectId.isValid(req.user.data._id)) {
    throw CustomError.create(400, 'Invalid user id');
  }

  if (blog.author !== req.user.data._id) {
    throw CustomError.create(400, 'you can not update this blog');
  }

  if (req.file) {
    const image = await uploadImage(req.file, 'blogs', req.body.title || blog.title);
    req.body.image = image;
  }

  Object.keys(req.body).forEach((key) => {
    blog[key] = req.body[key];
  });

  await blog.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { blog },
  });
});

module.exports = {
  getAllBlogs,
  getOneBlog,
  addOneBlog,
  deleteOneBlog,
  updateBlog,
};
