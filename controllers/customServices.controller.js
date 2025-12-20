const { validationResult } = require('express-validator');
const CustomServices = require('../models/customServices.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');
const { CustomServicesMessages } = require('../constants');

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

  const filter = search.trim() ? { name: { $regex: search, $options: 'i' } } : {};

  const customServices = await CustomServices.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await CustomServices.countDocuments(filter);

  if (customServices.length === 0) {
    throw CustomError.create(404, CustomServicesMessages.notFound);
  }

  if (req.user.role == userRole.admin || req.user.role == userRole.humanRelations) {
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
  }

  throw CustomError.create(400, CustomServicesMessages.justHrAndAdmin);
});

const getOneCustomServices = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, CustomServicesMessages.invalidId);
  }

  const customServices = await CustomServices.findById(id, { __v: false });

  if (!customServices) {
    throw CustomError.create(404, CustomServicesMessages.notFound);
  }

  if (req.user.role == userRole.admin || req.user.role == userRole.humanRelations) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { customServices },
    });
  }

  throw CustomError.create(400, CustomServicesMessages.justHrAndAdmin);
});

const deleteOneCustomServices = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
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

module.exports = {
  addOneCustomServices,
  getAllCustomServices,
  getOneCustomServices,
  deleteOneCustomServices,
};
