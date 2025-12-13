const { validationResult } = require('express-validator');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const userRole = require('../utils/user.roles');
const uploadImage = require('../utils/upload.Image');
const formatDate = require('../utils/format.date');
const Portfolio = require('../models/portfolio.model');
const httpStatusText = require('../utils/http.status.text');
const { default: mongoose } = require('mongoose');
const deleteImage = require('../utils/delete.image');

const addOnePortfolio = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not add Portfolio');
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

  const portfolio = await Portfolio.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { portfolio },
  });
});

const getAllPortfolio = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const category = req.query.category || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (['print', 'Design and programming', 'marketing'].includes(category)) {
    const filter = search.trim()
      ? { title: { $regex: search, $options: 'i' }, category: category }
      : { category: category };
    const portfolio = await Portfolio.find(filter, { __v: false }).skip(skip).limit(limit);

    const total = await Portfolio.countDocuments(filter);

    if (portfolio.length === 0) {
      throw CustomError.create(404, 'No data found');
    }

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        category,
        portfolio,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const portfolio = await Portfolio.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Portfolio.countDocuments(filter);

  if (portfolio.length === 0) {
    throw CustomError.create(404, 'No data found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      portfolio,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOnePortfolio = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid portfolio id');
  }

  const portfolio = await Portfolio.findById(id, { __v: false });

  if (!portfolio) {
    throw CustomError.create(404, 'portfolio not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { portfolio },
  });
});

const updatePortfolio = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not update this Portfolio');
  }

  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    throw CustomError.create(404, 'portfolio not found');
  }

  if (req.file) {
    const image = await uploadImage(req.file, 'portfolio', req.body.title || blog.title);
    req.body.image = image;
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== '') {
      portfolio[key] = req.body[key];
    }
  });

  await portfolio.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { portfolio },
  });
});

const deleteOnePortfolio = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete Portfolio');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid Portfolio id');
  }

  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    throw CustomError.create(404, 'Portfolio not found');
  }

  if (portfolio.image) {
    try {
      await deleteImage(portfolio.image);
    } catch (error) {
      throw CustomError.create(400, 'Error deleting image from Cloudinary:');
    }
  }

  const result = await Portfolio.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'Portfolio not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  addOnePortfolio,
  getAllPortfolio,
  getOnePortfolio,
  updatePortfolio,
  deleteOnePortfolio,
};
