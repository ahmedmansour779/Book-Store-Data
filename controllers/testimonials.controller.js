const { validationResult } = require('express-validator');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const userRole = require('../utils/user.roles');
const Testimonials = require('../models/testimonials.model');
const httpStatusText = require('../utils/http.status.text');
const { default: mongoose } = require('mongoose');
const { testimonialsMessages } = require('../constants');

const addOneTestimonials = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { title, description, jobDescription, rating, image } = req.body;

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, testimonialsMessages.notAddAccessibility);
  }

  const testimonial = await Testimonials.create({
    title,
    description,
    jobDescription,
    rating,
    image,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { testimonial },
    message: testimonialsMessages.addSuccess,
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
    throw CustomError.create(400, testimonialsMessages.invalidId);
  }

  const testimonial = await Testimonials.findById(id, { __v: false });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: testimonial ? { testimonial } : null,
  });
});

const updateTestimonial = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, testimonialsMessages.notEditAccessibility);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, testimonialsMessages.invalidId);
  }

  const testimonial = await Testimonials.findById(id);
  if (!testimonial) {
    throw CustomError.create(404, testimonialsMessages.notFound);
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
    message: testimonialsMessages.editSuccess,
  });
});

const deleteOneTestimonial = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, testimonialsMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, testimonialsMessages.invalidId);
  }

  const result = await Testimonials.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, testimonialsMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: testimonialsMessages.deleteSuccess,
  });
});

module.exports = {
  addOneTestimonials,
  getAllTestimonials,
  getOneTestimonial,
  updateTestimonial,
  deleteOneTestimonial,
};
