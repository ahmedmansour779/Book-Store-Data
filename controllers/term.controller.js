const { validationResult } = require('express-validator');
const CustomError = require('../utils/custom.error');
const Terms = require('../models/terms.model');
const asyncWrapper = require('../middlewares/async.wrapper');
const formatDate = require('../utils/format.date');
const httpStatusText = require('../utils/http.status.text');
const { default: mongoose } = require('mongoose');
const userRole = require('../utils/user.roles');

const addOneTerm = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not add terms');
  }

  if (!req.body.date) {
    req.body.created = formatDate();
  }

  let items = JSON.parse(req.body.items);
  if (!Array.isArray(items)) {
    throw CustomError.create(400, 'items must be a valid JSON array of strings');
  }

  req.body.items = items;

  const terms = await Terms.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { terms },
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

  if (terms.length === 0) {
    throw CustomError.create(404, 'No terms found');
  }

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
    throw CustomError.create(400, 'Invalid term id');
  }

  const term = await Terms.findById(id, { __v: false });

  if (!term) {
    throw CustomError.create(404, 'term not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { term },
  });
});

const updateTerm = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (!mongoose.Types.ObjectId.isValid(req.user.data._id)) {
    throw CustomError.create(400, 'Invalid term id');
  }

  const term = await Terms.findById(id);
  if (!term) {
    throw CustomError.create(404, 'term not found');
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not update this term');
  }

  if (req.body.items) {
    if (typeof req.body.items === 'string') {
      try {
        req.body.items = JSON.parse(req.body.items);
      } catch (err) {
        throw CustomError.create(400, 'items must be a valid JSON array');
      }
    }
  } else {
    req.body.items = term.items || [];
  }

  Object.keys(req.body).forEach((key) => {
    term[key] = req.body[key];
  });

  await term.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { term },
  });
});

const deleteOneTerm = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete term');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid term id');
  }

  const result = await Terms.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'term not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  addOneTerm,
  getAllTerms,
  getOneTerm,
  updateTerm,
  deleteOneTerm,
};
