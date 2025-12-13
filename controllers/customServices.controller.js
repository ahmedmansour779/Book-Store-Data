const { validationResult } = require('express-validator');
const CustomServices = require('../models/customServices.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');
const uploadPdf = require('../utils/upload.pdf');

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
  } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.user) {
    throw CustomError.create(400, 'you can not add Custom Services');
  }

  let file;
  if (req.file) {
    file = await uploadPdf(req.file, 'CustomServices', req.body.fullName);
  }

  if (!file) {
    throw CustomError.create(400, 'file (pdf file) is required');
  }

  const idUser = req.user.data._id;

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
    file,
    idUser,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { customServices },
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
    throw CustomError.create(404, 'No Custom Services found');
  }

  if (req.user.data.role == userRole.owner || req.user.data.role == userRole.humanRelations) {
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

  throw CustomError.create(400, 'just human Relations and owners can access to this data');
});

const getOneCustomServices = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid massage id');
  }

  const customServices = await CustomServices.findById(id, { __v: false });

  if (!customServices) {
    throw CustomError.create(404, 'Custom Services not found');
  }

  if (req.user.data.role == userRole.owner || req.user.data.role == userRole.humanRelations) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { customServices },
    });
  }

  throw CustomError.create(400, 'just human Relations and owners can access to this data');
});

const deleteOneCustomServices = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete this Services');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid massage id');
  }

  const result = await CustomServices.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'Services not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  addOneCustomServices,
  getAllCustomServices,
  getOneCustomServices,
  deleteOneCustomServices,
};
