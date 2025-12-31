const { validationResult } = require('express-validator');
const CustomError = require('../utils/custom.error');
const Users = require('../models/user.model');
const httpStatusText = require('../utils/http.status.text');
const asyncWrapper = require('../middlewares/async.wrapper');
const bcryptjs = require('bcryptjs');
const generateToken = require('../utils/generate.token');
const { sendOTP } = require('../utils/sendOTP');
const OTP = require('../models/otp.model');
const { default: mongoose } = require('mongoose');
const userRole = require('../utils/user.roles');
const { userMessages } = require('../constants');
const { passwordSchema } = require('../utils/validation/registerAdminSchema');
const AppError = require('../utils/app.error');

const register = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { name, phone, whatsapp, favoriteContact, companyName, email, password } = req.body;

  const oldUser = await Users.findOne({ email });

  if (oldUser) {
    throw CustomError.create(400, userMessages.emailExists);
  }

  const hashingPassword = await bcryptjs.hash(password, 10);

  const user = await Users.create({
    email,
    name,
    phone,
    whatsapp,
    favoriteContact,
    companyName,
    password: hashingPassword,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { user },
    message: userMessages.registerSuccess,
  });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw CustomError.create(400, userMessages.emailAndPasswordRequired);
  }

  const user = await Users.findOne({ email });

  if (!user) {
    throw CustomError.create(400, userMessages.invalidEmail);
  }

  const matchPassword = await bcryptjs.compare(password, user.password);
  if (!matchPassword) {
    throw CustomError.create(400, userMessages.invalidPassword);
  }

  const token = await generateToken(user, '24h');
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: userMessages.loginSuccess,
    data: { token },
  });
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw CustomError.create(400, userMessages.emailRequired);
  }

  const user = await Users.findOne({ email });

  if (!user) {
    throw CustomError.create(400, userMessages.invalidEmail);
  }

  const otp = await sendOTP(email);

  await OTP.create({
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // بعد 10 دقايق
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: userMessages.otpSent,
    data: null,
  });
});

const verifyOTP = asyncWrapper(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({
    email,
    expiresAt: { $gt: Date.now() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw CustomError.create(400, userMessages.otpExpired);
  }

  if (otpRecord.otp !== otp) {
    throw CustomError.create(400, userMessages.invalidOTP);
  }
  await OTP.deleteOne({ _id: otpRecord._id });
  const user = await Users.findOne({ email });
  const payload = {
    id: user._id,
    email: user.email,
  };
  const token = await generateToken(payload, '24h');

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: userMessages.otpVerified,
    data: { token, id: user.id },
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, id, password } = req.body;

  try {
    await passwordSchema.validate({ password }, { abortEarly: false });
  } catch (error) {
    return next(new AppError(error.errors.join(', '), 400, httpStatusText.FAIL));
  }

  if (email === req.user.email && id === req.user.id) {
    const admin = await Users.findById(req.user.id);
    if (!admin) {
      return next(new AppError(userMessages.invalidEmail, 404, httpStatusText.FAIL));
    }

    const hashingPassword = await bcryptjs.hash(password, 10);
    admin.password = hashingPassword;
    await admin.save();

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: userMessages.resetPasswordSuccess,
    });
  }

  return res.status(400).json({
    status: httpStatusText.FAIL,
    message: userMessages.resetPasswordFail,
  });
});

const getAllUser = asyncWrapper(async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, userMessages.notGetAccessibility);
  }

  const users = await Users.find(filter, { __v: false }).skip(skip).limit(limit);

  const total = await Users.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneUser = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, userMessages.invalidIUserId);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, userMessages.notGetAccessibility);
  }

  const user = await Users.findById(id, { __v: false, password: false });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: user ? { user } : null,
  });
});

const editProfileData = asyncWrapper(async (req, res, next) => {
  const id = req.user._id;
  const { password, email, name, phone, whatsapp, favoriteContact, companyName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, userMessages.invalidIUserId);
  }

  const user = await Users.findById(id, { __v: false });

  if (!user) {
    throw CustomError.create(404, userMessages.invalidEmail);
  }

  let hashedPassword = user.password;

  if (password) {
    hashedPassword = await bcryptjs.hash(password, 10);
    try {
      await passwordSchema.validate({ password }, { abortEarly: false });
    } catch (error) {
      return next(new AppError(error.errors.join(', '), 400, httpStatusText.FAIL));
    }
  }

  const emailExists = await Users.findOne({ email });

  if (emailExists) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: userMessages.emailExists,
    });
  }

  user.password = hashedPassword;
  user.email = email || user.email;
  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.whatsapp = whatsapp || user.whatsapp;
  user.favoriteContact = favoriteContact || user.favoriteContact;
  user.companyName = companyName || user.companyName;

  await user.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user },
    message: userMessages.updateSuccess,
  });
});

const deleteOneUser = asyncWrapper(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, userMessages.invalidIUserId);
  }

  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, userMessages.notDeleteAccessibility);
  }

  const result = await Users.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, userMessages.userNotFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: userMessages.deleteSuccess,
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAllUser,
  getOneUser,
  editProfileData,
  deleteOneUser,
};
