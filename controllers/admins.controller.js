const asyncWrapper = require('../middlewares/async.wrapper');
const httpStatusText = require('../utils/http.status.text');
const Admin = require('../models/admin.model');
const bcryptjs = require('bcryptjs');
const generateToken = require('../utils/generate.token');
const adminSchema = require('../utils/validation/registerAdminSchema');
const loginSchema = require('../utils/validation/loginAdminSchema');
const forgotPasswordSchema = require('../utils/validation/forgotPasswordSchema');
const verifyOTPSchema = require('../utils/validation/verifyOTPSchema');
const AppError = require('../utils/app.error');
const { adminMessages } = require('../constants/index');
const OTP = require('../models/otp.model');
const { sendOTP } = require('../utils/sendOTP');

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
  const { name, phone, email, password } = req.body;

  try {
    await adminSchema.validate({ name, phone, email, password }, { abortEarly: false });
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

  const payload = {
    id: admin._id,
    email: admin.email,
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

module.exports = {
  adminRegister,
  adminLogin,
  getAdminData,
  adminForgotPassword,
  verifyOTP,
};
