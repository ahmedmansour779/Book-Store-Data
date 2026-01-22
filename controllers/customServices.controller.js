import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { CustomServicesMessages } from '../constants/index.js';
import asyncWrapper from '../middlewares/async.wrapper.js';
import CustomServices from '../models/customServices.model.js';
import adminRole from '../utils/constants/admin.roles.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import CustomError from '../utils/errors/custom.error.js';

const addOneCustomServices = asyncWrapper(async (req, res) => {
  const {
    name,
    companyName,
    email,
    phone,
    whatsapp,
    favoriteContact,
    typeService,
    serviceDetails,
    massage,
    file,
  } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const idUser = req.user._id;

  const customServices = await CustomServices.create({
    name,
    companyName,
    email,
    phone,
    whatsapp,
    favoriteContact,
    typeService,
    serviceDetails,
    massage,
    idUser,
    file,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { customServices },
    message: CustomServicesMessages.addSuccess,
  });
});

const getAllCustomServices = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = search.trim() ? { name: { $regex: search, $options: 'i' } } : {};

  switch (req.user.role) {
    case adminRole.admin:
      break;

    case adminRole.printCustomServiceViewer:
      filter.typeService = 'printing';
      break;

    case adminRole.marketingCustomServiceViewer:
      filter.typeService = 'marketing';
      break;

    case adminRole.programmingCustomServiceViewer:
      filter.typeService = 'design and programming';
      break;

    default:
      throw CustomError.create(400, CustomServicesMessages.notShowAccessibility);
  }

  const customServices = await CustomServices.find(filter, { __v: false })
    .skip(skip)
    .limit(limit);

  const total = await CustomServices.countDocuments(filter);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      customServices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneCustomServices = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, CustomServicesMessages.invalidId);
  }

  const customServices = await CustomServices.findById(id, { __v: false });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: customServices ? { customServices } : null,
  });
});

const deleteOneCustomServices = asyncWrapper(async (req, res) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, CustomServicesMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, CustomServicesMessages.invalidId);
  }

  const result = await CustomServices.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, CustomServicesMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: CustomServicesMessages.deleteSuccess,
  });
});

export default {
  addOneCustomServices,
  getAllCustomServices,
  getOneCustomServices,
  deleteOneCustomServices,
};
