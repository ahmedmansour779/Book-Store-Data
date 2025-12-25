const { validationResult } = require('express-validator');
const CustomError = require('../utils/custom.error');
const Contact = require('../models/contact.model');
const asyncWrapper = require('../middlewares/async.wrapper');
const httpStatusText = require('../utils/http.status.text');
const { default: mongoose } = require('mongoose');
const userRole = require('../utils/user.roles');
const { contactMessages } = require('../constants');

const addOneContact = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { name, companyName, email, phone, subject, massage } = req.body;

  const result = await Contact.create({ name, companyName, email, phone, subject, massage });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { result },
    message: contactMessages.addSuccess,
  });
});

const getAllContact = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, contactMessages.notShowAccessibility);
  }
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { name: { $regex: search, $options: 'i' } } : {};

  const massages = await Contact.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Contact.countDocuments(filter);

  if (massages.length === 0) {
    throw CustomError.create(404, contactMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      massages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneContact = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, contactMessages.notShowAccessibility);
  }
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, contactMessages.invalidId);
  }

  const massage = await Contact.findById(id, { __v: false });

  if (!massage) {
    throw CustomError.create(404, contactMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { massage },
  });
});

const deleteOneContact = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, contactMessages.notDeleteAccessibility);
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, contactMessages.invalidId);
  }

  const result = await Contact.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, contactMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: contactMessages.deleteSuccess,
  });
});

module.exports = {
  addOneContact,
  getAllContact,
  getOneContact,
  deleteOneContact,
};
