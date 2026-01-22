import { validationResult } from 'express-validator';
import CustomError from '../utils/errors/custom.error.js';
import Users from '../models/user.model.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import asyncWrapper from '../middlewares/async.wrapper.js';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/security/generate.token.js';
import { sendOTP } from '../utils/security/sendOTP.js';
import OTP from '../models/otp.model.js';
import mongoose from 'mongoose';
import userRole from '../utils/constants/admin.roles.js';
import { userMessages, adminMessages } from '../constants/index.js';
import { passwordSchema } from '../utils/validation/registerAdminSchema.js';
import AppError from '../utils/errors/app.error.js';

const register = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw CustomError.create(400, errors.errors[0].msg);
  }

  const { name, phone, whatsapp, favoriteContact, companyName, email, password } = req.body;
  const user = { name, phone, whatsapp, favoriteContact, companyName, email, password };

  const oldUser = await Users.findOne({ email });

  if (oldUser) {
    throw CustomError.create(400, userMessages.emailExists);
  }

  const otp = await sendOTP(email);

  await OTP.create({
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // بعد 10 دقايق
  });

  const token = await generateToken(user, '24h');
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: userMessages.otpSent,
    data: token,
  });
});

const verifyUser = asyncWrapper(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw CustomError.create(400, userMessages.missingData);
  }

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

  const oldUser = await Users.findOne({ email });

  if (oldUser) {
    throw CustomError.create(400, userMessages.emailExists);
  }

  const user = await Users.create(req.user);

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

  if (user.block) {
    throw CustomError.create(400, adminMessages.notAuthorized);
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

const toggleUserBlock = asyncWrapper(async (req, res) => {
  if (req.user.role !== userRole.admin) {
    throw CustomError.create(400, adminMessages.notAuthorized);
  }
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, userMessages.invalidId);
  }
  const result = await Users.findById(id);

  if (!result) {
    throw CustomError.create(404, userMessages.adminNotFound);
  }

  result.block = !result.block;

  await result.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { block: result.block },
    message: result.block ? userMessages.userBlocked : userMessages.userUnblocked,
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

export default {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAllUser,
  getOneUser,
  editProfileData,
  deleteOneUser,
  toggleUserBlock,
  verifyUser,
};
