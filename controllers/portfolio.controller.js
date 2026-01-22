import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { portfolioMessages } from '../constants/index.js';
import asyncWrapper from '../middlewares/async.wrapper.js';
import Portfolio from '../models/portfolio.model.js';
import adminRole from '../utils/constants/admin.roles.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import CustomError from '../utils/errors/custom.error.js';

const addOnePortfolio = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { title, image, url, category } = req.body;

  if (req.user.role == adminRole.admin || req.user.role == adminRole.portfolioCreator) {
    const portfolio = await Portfolio.create({ title, image, url, category });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { portfolio },
      message: portfolioMessages.addSuccess,
    });

    throw CustomError.create(400, portfolioMessages.notAddAccessibility);
  }
  throw CustomError.create(400, portfolioMessages.notAddAccessibility);
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
    throw CustomError.create(400, portfolioMessages.invalidId);
  }

  const portfolio = await Portfolio.findById(id, { __v: false });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: portfolio ? { portfolio } : null,
  });
});

const updatePortfolio = asyncWrapper(async (req, res) => {
  if (req.user.role == adminRole.admin || req.user.role == adminRole.portfolioCreator) {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw CustomError.create(400, errors.errors[0].msg);
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      throw CustomError.create(404, portfolioMessages.notFound);
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
      message: portfolioMessages.editSuccess,
    });
  }
  throw CustomError.create(400, portfolioMessages.notEditAccessibility);
});

const deleteOnePortfolio = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, portfolioMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, portfolioMessages.invalidId);
  }

  const result = await Portfolio.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, portfolioMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: portfolioMessages.deleteSuccess,
  });
});

export default {
  addOnePortfolio,
  getAllPortfolio,
  getOnePortfolio,
  updatePortfolio,
  deleteOnePortfolio,
};
