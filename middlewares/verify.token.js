import jwt from 'jsonwebtoken';
import AppError from '../utils/errors/app.error.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';

const messages = {
  tokenRequired: 'يجب تسجيل الدخول أولاً',
  invalidToken: 'التوكن غير صالح',
  expiredToken: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  malformedToken: 'صيغة التوكن غير صحيحة',
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return next(new AppError(messages.tokenRequired, 401, httpStatusText.FAIL));
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(new AppError(messages.malformedToken, 401, httpStatusText.FAIL));
    }

    const token = parts[1];

    if (!token) {
      return next(new AppError(messages.tokenRequired, 401, httpStatusText.FAIL));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_CODE);
    req.user = decoded.data;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(messages.expiredToken, 401, httpStatusText.FAIL));
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new AppError(messages.invalidToken, 401, httpStatusText.FAIL));
    }

    return next(new AppError(messages.invalidToken, 401, httpStatusText.FAIL));
  }
};

export default verifyToken;
