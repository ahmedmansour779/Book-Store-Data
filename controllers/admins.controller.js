import asyncWrapper from '../middlewares/async.wrapper.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import Admin from '../models/admin.model.js';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/security/generate.token.js';
import { adminSchema, passwordSchema } from '../utils/validation/registerAdminSchema.js';
import loginSchema from '../utils/validation/loginAdminSchema.js';
import forgotPasswordSchema from '../utils/validation/forgotPasswordSchema.js';
import verifyOTPSchema from '../utils/validation/verifyOTPSchema.js';
import AppError from '../utils/errors/app.error.js';
import { adminMessages } from '../constants/index.js';
import OTP from '../models/otp.model.js';
import { sendOTP } from '../utils/security/sendOTP.js';
import adminRole from '../utils/constants/admin.roles.js';
import CustomError from '../utils/errors/custom.error.js';
import mongoose from 'mongoose';

const getAllAdmins = asyncWrapper(async (req, res) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, adminMessages.notShowAccessibility);
  }

  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

  const admins = await Admin.find(filter, { __v: false, password: false }).skip(skip).limit(limit);

  const total = await Admin.countDocuments(filter);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      admins,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOneAdmin = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, adminMessages.notShowAccessibility);
  }
  const id = req.params.id;

  const admin = await Admin.findById(id).select('-password -__v');

  if (!admin) {
    return next(new AppError(adminMessages.notFound, 404, httpStatusText.FAIL));
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.dataFetched,
    data: admin,
  });
});

const deleteOneAdmin = asyncWrapper(async (req, res) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, adminMessages.notDeleteAccessibility);
  }
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, adminMessages.invalidId);
  }

  const result = await Admin.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw CustomError.create(404, adminMessages.notFound);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: adminMessages.deleteSuccess,
  });
});

const changeRoleAdmin = asyncWrapper(async (req, res) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, adminMessages.notEditAccessibility);
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, adminMessages.invalidId);
  }

  const admin = await Admin.findById(id);

  admin.role = req.body.role;

  await admin.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { admin },
    message: adminMessages.changeRoleSuccess,
  });
});

const updateAdminData = asyncWrapper(async (req, res) => {
  if (req.body.role) {
    throw CustomError.create(400, adminMessages.notEditAccessibility);
  }
  const result = await Admin.findById(req.user.id);

  Object.keys(req.body).forEach((key) => {
    if (req.body[key].length > 0) {
      result[key] = req.body[key];
    }
  });

  if (req.body.password) {
    const hashingPassword = await bcryptjs.hash(req.body.password, 10);
    result.password = hashingPassword;
  }

  await result.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { result },
    message: adminMessages.editSuccess,
  });
});

const toggleAdminBlock = asyncWrapper(async (req, res) => {
  if (req.user.role !== adminRole.admin) {
    throw CustomError.create(400, adminMessages.notAuthorized);
  }
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw CustomError.create(400, adminMessages.invalidId);
  }
  const result = await Admin.findById(id);

  if (!result) {
    throw CustomError.create(404, adminMessages.adminNotFound);
  }

  result.block = !result.block;

  await result.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { block: result.block },
    message: result.block ? adminMessages.adminBlocked : adminMessages.adminUnblocked,
  });
});

const getAdminData = asyncWrapper(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id).select('-password -__v');

  if (!admin) {
    return next(new AppError(adminMessages.adminNotFound, 404, httpStatusText.FAIL));
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.dataFetched,
    data: admin,
  });
});

const adminRegister = asyncWrapper(async (req, res, next) => {
  const { name, phone, email, password, role, country } = req.body;

  try {
    await adminSchema.validate({ name, phone, email, password, role }, { abortEarly: false });
  } catch (error) {
    const validationErrors = error.errors.join(', ');
    return next(new AppError(validationErrors, 400, httpStatusText.FAIL));
  }

  const existAdmin = await Admin.findOne({ email });
  if (existAdmin) {
    return next(new AppError(adminMessages.adminExists, 400, httpStatusText.FAIL));
  }

  const hashingPassword = await bcryptjs.hash(password, 10);

  const admin = await Admin.create({
    name,
    phone,
    email,
    role,
    country,
    password: hashingPassword,
  });

  const payload = {
    id: admin._id,
    email: admin.email,
  };

  const token = await generateToken(payload, '7d');

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.registrationSuccess,
    token,
  });
});

const adminLogin = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await loginSchema.validate({ email, password }, { abortEarly: false });
  } catch (error) {
    const validationErrors = error.errors.join(', ');
    return next(new AppError(validationErrors, 400, httpStatusText.FAIL));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError(adminMessages.invalidCredentials, 401, httpStatusText.FAIL));
  }

  const isPasswordValid = await bcryptjs.compare(password, admin.password);
  if (!isPasswordValid) {
    return next(new AppError(adminMessages.invalidCredentials, 401, httpStatusText.FAIL));
  }

  if (admin.block) {
    return next(new AppError(adminMessages.notAuthorized, 401, httpStatusText.FAIL));
  }

  const payload = {
    id: admin._id,
    email: admin.email,
    role: admin.role,
  };

  const token = await generateToken(payload, '7d');

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.loginSuccess,
    token,
  });
});

const adminForgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  try {
    await forgotPasswordSchema.validate({ email }, { abortEarly: false });
  } catch (error) {
    const validationErrors = error.errors.join(', ');
    return next(new AppError(validationErrors, 400, httpStatusText.FAIL));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError(adminMessages.emailNotFound, 404, httpStatusText.FAIL));
  }

  const otp = await sendOTP(email);
  await OTP.create({
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.otpSent,
  });
});

const verifyOTP = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    await verifyOTPSchema.validate({ email, otp }, { abortEarly: false });
  } catch (error) {
    const validationErrors = error.errors.join(', ');
    return next(new AppError(validationErrors, 400, httpStatusText.FAIL));
  }

  const otpRecord = await OTP.findOne({
    email,
    expiresAt: { $gt: Date.now() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return next(new AppError(adminMessages.otpExpired, 400, httpStatusText.FAIL));
  }

  if (otpRecord.otp !== otp) {
    return next(new AppError(adminMessages.invalidOTP, 400, httpStatusText.FAIL));
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError(adminMessages.adminNotFound, 404, httpStatusText.FAIL));
  }

  const payload = {
    id: admin._id,
    email: admin.email,
  };

  const token = await generateToken(payload, '24h');

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: adminMessages.otpVerified,
    data: {
      token,
      id: admin._id,
    },
  });
});

const resetPasswordAdmin = asyncWrapper(async (req, res, next) => {
  const { email, id, password } = req.body;

  try {
    await passwordSchema.validate({ password }, { abortEarly: false });
  } catch (error) {
    return next(new AppError(error.errors.join(', '), 400, httpStatusText.FAIL));
  }

  if (email === req.user.email && id === req.user.id) {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return next(new AppError('البريد الإلكتروني غير موجود', 404, httpStatusText.FAIL));
    }

    const hashingPassword = await bcryptjs.hash(password, 10);
    admin.password = hashingPassword;
    await admin.save();

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: adminMessages.resetPasswordSuccess,
    });
  }

  return res.status(400).json({
    status: httpStatusText.FAIL,
    message: adminMessages.resetPasswordFail,
  });
});

export default {
  adminRegister,
  adminLogin,
  getAdminData,
  adminForgotPassword,
  verifyOTP,
  resetPasswordAdmin,
  getAllAdmins,
  getOneAdmin,
  deleteOneAdmin,
  changeRoleAdmin,
  updateAdminData,
  toggleAdminBlock,
};
