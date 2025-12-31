const { validationResult } = require('express-validator');
const StandardService = require('../models/standardService.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');
const getCountry = require('../utils/get.Country');
const { StandardServiceMessages } = require('../constants');

const addOneStandardService = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, StandardServiceMessages.notAddAccessibility);
  }

  const { title, image, priceEgypt, priceSaudi } = req.body;

  const service = await StandardService.create({ title, image, priceEgypt, priceSaudi });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: service ? { service } : null,
    message: StandardServiceMessages.addSuccess,
  });
});

const getAllStandardService = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const country = getCountry(req);

  if (country == 'EG') {
    const services = await StandardService.find(filter, { __v: false, priceSaudi: false })
      .skip(skip)
      .limit(limit);

    const total = await StandardService.countDocuments(filter);

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        services,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  const services = await StandardService.find(filter, { __v: false, priceEgypt: false })
    .skip(skip)
    .limit(limit);

  const total = await StandardService.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getAllStandardServiceAllPrices = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, StandardServiceMessages.notShowAccessibility);
  }
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const services = await StandardService.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await StandardService.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const updateStandardService = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, StandardServiceMessages.notEditAccessibility);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, StandardServiceMessages.invalidId);
  }

  const services = await StandardService.findById(id);
  if (!services) {
    throw CustomError.create(404, StandardServiceMessages.notFound);
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key].length > 0) {
      services[key] = req.body[key];
    }
  });

  await services.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { services },
    message: StandardServiceMessages.editSuccess,
  });
});

const deleteOneStandardService = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, StandardServiceMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, StandardServiceMessages.invalidId);
  }

  const result = await StandardService.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, StandardServiceMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: StandardServiceMessages.deleteSuccess,
  });
});

const applyStandardService = asyncWrapper(async (req, res) => {
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: StandardServiceMessages.addSuccess,
  });
});

module.exports = {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
  getAllStandardServiceAllPrices,
};
