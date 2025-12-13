const { validationResult } = require('express-validator');
const StandardService = require('../models/standardService.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const uploadImage = require('../utils/upload.Image');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');
const uploadPdf = require('../utils/upload.pdf');
const getCountry = require('../utils/get.Country');

const addOneStandardService = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not add Standard Service');
  }

  let image;
  if (req.file) {
    image = await uploadImage(req.file, 'StandardService', req.body.title);
    req.body.image = image;
  }

  if (!req.body.image) {
    throw CustomError.create(400, 'image is required');
  }

  const service = await StandardService.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { service },
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

    if (services.length === 0) {
      throw CustomError.create(404, 'No services found');
    }

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

  if (services.length === 0) {
    throw CustomError.create(404, 'No services found');
  }

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

  const services = await StandardService.findById(id);
  if (!services) {
    throw CustomError.create(404, 'services not found');
  }

  if (!mongoose.Types.ObjectId.isValid(req.user.data._id)) {
    throw CustomError.create(400, 'Invalid user id');
  }

  if (req.file) {
    const image = await uploadImage(req.file, 'StandardService', req.body.title || job.title);
    req.body.image = image;
  }

  Object.keys(req.body).forEach((key) => {
    services[key] = req.body[key];
  });

  await services.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { services },
  });
});

const deleteOneStandardService = asyncWrapper(async (req, res) => {
  if (req.user.data.role !== userRole.owner) {
    throw CustomError.create(400, 'you can not delete Service');
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, 'Invalid Service id');
  }

  const result = await StandardService.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, 'Service not found');
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

const applyStandardService = asyncWrapper(async (req, res) => {
  const jobId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw CustomError.create(400, 'Invalid job id');
  }

  const job = await Jobs.findById(jobId);

  if (!job) {
    throw CustomError.create(404, 'Job not found');
  }

  let cv;
  if (req.file) {
    cv = await uploadPdf(req.file, 'CVs', req.body.fullName);
  }

  if (!cv) {
    throw CustomError.create(400, 'CV (pdf file) is required');
  }

  const application = {
    fullName: req.body.fullName,
    country: req.body.country,
    state: req.body.state,
    gender: req.body.gender,
    email: req.body.email,
    phone: req.body.phone,
    cv: cv,
    message: req.body.message || '',
  };

  job.applications.push(application);

  await job.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: 'Application submitted successfully',
    data: { application },
  });
});

module.exports = {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
};
