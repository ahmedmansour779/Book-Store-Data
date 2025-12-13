const { validationResult } = require('express-validator');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const userRole = require('../utils/user.roles');
const uploadImage = require('../utils/upload.Image');
const formatDate = require('../utils/format.date');
const Testimonials = require('../models/testimonials.model');
const httpStatusText = require('../utils/http.status.text');
const { default: mongoose } = require('mongoose');

const addOneTestimonials = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not add Testimonials');
  }

  let image;
  if (req.file) {
    image = await uploadImage(req.file, 'testimonials', req.body.title);
    req.body.image = image;
  }

  if (!req.body.image) {
    throw CustomError.create(400, 'image is required');
  }

  if (!req.body.created) {
    req.body.created = formatDate();
  }

  const testimonial = await Testimonials.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { testimonial },
  });
});

const getAllTestimonials = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const testimonials = await Testimonials.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Testimonials.countDocuments(filter);

  if (testimonials.length === 0) {
    throw CustomError.create(404, 'No testimonials found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      testimonials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneTestimonial = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid Testimonials id');
  }

  const testimonial = await Testimonials.findById(id, { __v: false });

  if (!testimonial) {
    throw CustomError.create(404, 'testimonial not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { testimonial },
  });
});

const updateTestimonial = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const testimonial = await Testimonials.findById(id);
  if (!testimonial) {
    throw CustomError.create(404, 'Testimonial not found');
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not update this Testimonial');
  }

  if (req.file) {
    const image = await uploadImage(req.file, 'testimonials', req.body.title || blog.title);
    req.body.image = image;
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== '') {
      testimonial[key] = req.body[key];
    }
  });

  await testimonial.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { testimonial },
  });
});

const deleteOneTestimonial = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete Testimonial');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid Testimonial id');
  }

  const result = await Testimonials.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'Testimonial not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  addOneTestimonials,
  getAllTestimonials,
  getOneTestimonial,
  updateTestimonial,
  deleteOneTestimonial,
};
