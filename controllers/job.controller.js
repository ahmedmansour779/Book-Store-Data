const { validationResult } = require('express-validator');
const Jobs = require('../models/job.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require('../utils/custom.error');
const formatDate = require('../utils/format.date');
const mongoose = require('mongoose');
const userRole = require('../utils/user.roles');
const { jobsMessages } = require('../constants');

const addOneJob = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (req.user.role !== userRole.humanRelations) {
    throw CustomError.create(400, jobsMessages.notAddAccessibility);
  }

  const { title, description, image, employmentType, experience } = req.body;
  const created = formatDate();
  const author = req.user.id;

  const job = await Jobs.create({
    title,
    description,
    image,
    employmentType,
    experience,
    created,
    author,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { job },
    message: jobsMessages.blogAddSuccess,
  });
});

const getAllJobs = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  if (req.user.role !== userRole.humanRelations) {
    const jobs = await Jobs.find(filter, { __v: false, applications: false, author: false })
      .skip(skip)
      .limit(limit);

    const total = await Jobs.countDocuments(filter);

    if (jobs.length === 0) {
      throw CustomError.create(404, jobsMessages.JobNotFound);
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
  const jobs = await Jobs.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Jobs.countDocuments(filter);

  if (jobs.length === 0) {
    throw CustomError.create(404, jobsMessages.JobNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneJob = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, jobsMessages.invalidJobId);
  }

  if (req.user.role !== userRole.humanRelations) {
    const job = await Jobs.findById(id, { __v: false, applications: false, author: false });

    if (!job) {
      throw CustomError.create(404, jobsMessages.JobNotFound);
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { job },
    });
  }

  const job = await Jobs.findById(id, { __v: false });

  if (!job) {
    throw CustomError.create(404, jobsMessages.JobNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { job },
  });
});

const deleteOneJob = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, jobsMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, jobsMessages.invalidJobId);
  }

  const result = await Jobs.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, jobsMessages.JobNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: jobsMessages.deleteSuccess,
  });
});

const updateJob = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, jobsMessages.invalidJobId);
  }

  const job = await Jobs.findById(id);
  if (!job) {
    throw CustomError.create(404, jobsMessages.JobNotFound);
  }
  if (job.author !== req.user.id) {
    throw CustomError.create(400, jobsMessages.notUpdataAccessibility);
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key].length > 0) {
      job[key] = req.body[key];
    }
  });

  await job.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { job },
    message: jobsMessages.updateSuccess,
  });
});

const applyToJob = asyncWrapper(async (req, res) => {
  const jobId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw CustomError.create(400, jobsMessages.invalidJobId);
  }

  const job = await Jobs.findById(jobId);

  if (!job) {
    throw CustomError.create(404, jobsMessages.JobNotFound);
  }

  const application = {
    fullName: req.body.fullName,
    country: req.body.country,
    state: req.body.state,
    gender: req.body.gender,
    email: req.body.email,
    phone: req.body.phone,
    cv: req.body.cv,
    message: req.body.message || '',
  };

  job.applications.push(application);

  await job.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: jobsMessages.applySuccess,
    data: { application },
  });
});

module.exports = {
  addOneJob,
  getAllJobs,
  getOneJob,
  deleteOneJob,
  updateJob,
  applyToJob,
};
