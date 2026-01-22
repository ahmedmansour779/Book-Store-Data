import { validationResult } from 'express-validator';
import PrintStandardService from '../../models/standardServices/print.standardService.model.js';
import * as httpStatusText from '../../utils/constants/http.status.text.js';
import asyncWrapper from '../../middlewares/async.wrapper.js';
import CustomError from '../../utils/errors/custom.error.js';
import mongoose from 'mongoose';
import adminRole from '../../utils/constants/admin.roles.js';
import getCountry from '../../utils/common/get.Country.js';
import { StandardServiceMessages } from '../../constants/index.js';

const addOneStandardService = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.role == adminRole.printStandardServiceCreator || req.user.role == adminRole.admin) {
    const { title, image, priceEgypt, priceSaudi } = req.body;
    const service = await PrintStandardService.create({
      title,
      image,
      priceEgypt,
      priceSaudi,
      author: req.user.id,
    });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: service ? { service } : null,
      message: StandardServiceMessages.addSuccess,
    });
  }

  throw CustomError.create(400, StandardServiceMessages.notAddAccessibility);
});

const getAllStandardService = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const country = getCountry(req);

  if (country == 'EG') {
    const services = await PrintStandardService.find(filter, { __v: false, priceSaudi: false })
      .skip(skip)
      .limit(limit);

    const total = await PrintStandardService.countDocuments(filter);

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

  const services = await PrintStandardService.find(filter, { __v: false, priceEgypt: false })
    .skip(skip)
    .limit(limit);

  const total = await PrintStandardService.countDocuments(filter);

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
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  if (req.user.role == adminRole.printStandardServiceCreator || req.user.role == adminRole.admin) {
    const services = await PrintStandardService.find(filter, { __v: false })
      .skip(skip)
      .limit(limit);
    const total = await PrintStandardService.countDocuments(filter);

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

  throw CustomError.create(400, StandardServiceMessages.notShowAccessibility);
});

const updateStandardService = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, StandardServiceMessages.invalidId);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const services = await PrintStandardService.findById(id);
  if (!services) {
    throw CustomError.create(404, StandardServiceMessages.notFound);
  }
  if (req.user.author !== services.author) {
    throw CustomError.create(400, StandardServiceMessages.notEditAccessibility);
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
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, StandardServiceMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, StandardServiceMessages.invalidId);
  }

  const result = await PrintStandardService.deleteOne({ _id: id });

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

export default {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
  getAllStandardServiceAllPrices,
};
