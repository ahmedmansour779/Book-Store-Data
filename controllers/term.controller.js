import { validationResult } from 'express-validator';
import CustomError from '../utils/errors/custom.error.js';
import Terms from '../models/terms.model.js';
import asyncWrapper from '../middlewares/async.wrapper.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import mongoose from 'mongoose';
import userRole from '../utils/constants/admin.roles.js';
import { termsMessages } from '../constants/index.js';

const addOneTerm = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { items, title } = req.body;

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, termsMessages.notAddAccessibility);
  }

  let itemsData = JSON.parse(items);
  if (!Array.isArray(itemsData)) {
    throw CustomError.create(400, termsMessages.mustBeArray);
  }

  const terms = await Terms.create({
    title,
    items: itemsData,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { terms },
    message: termsMessages.addSuccess,
  });
});

const getAllTerms = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const terms = await Terms.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Terms.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      terms,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneTerm = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, termsMessages.invalidId);
  }

  const term = await Terms.findById(id, { __v: false });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: term ? { term } : null,
  });
});

const updateTerm = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, termsMessages.invalidId);
  }

  const term = await Terms.findById(id);
  if (!term) {
    throw CustomError.create(404, termsMessages.notFound);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, termsMessages.notEditAccessibility);
  }

  if (req.body.items) {
    if (typeof req.body.items === 'string') {
      try {
        term.items = JSON.parse(req.body.items);
      } catch (err) {
        throw CustomError.create(400, termsMessages.mustBeArray);
      }
    }
  } else {
    req.body.items = term.items || [];
  }

  term.title = req.body.title || term.title;

  await term.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { term },
    message: termsMessages.editSuccess,
  });
});

const deleteOneTerm = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, termsMessages.notEditAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, termsMessages.invalidId);
  }

  const result = await Terms.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, termsMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: termsMessages.deleteSuccess,
  });
});

export default {
  addOneTerm,
  getAllTerms,
  getOneTerm,
  updateTerm,
  deleteOneTerm,
};
