import asyncWrapper from '../middlewares/async.wrapper.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import uploadImage from '../utils/upload/upload.Image.js';
import AppError from '../utils/errors/app.error.js';
import uploadPdf from '../utils/upload/upload.pdf.js';

const uploadImageMethod = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('لم يتم إرفاق صورة', 400));
  }

  const maxSize = 10 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return next(new AppError('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت', 400));
  }

  const avatarUrl = await uploadImage(req.file, 'blogs', req.body.title);

  if (!avatarUrl) {
    return next(new AppError('فشل رفع الصورة. يرجى المحاولة مرة أخرى', 500));
  }

  req.body.image = avatarUrl;

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { image: avatarUrl },
    message: 'تم رفع الصورة بنجاح',
  });
});

const uploadFileMethod = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('لم يتم إرفاق ملف', 400));
  }

  if (req.file.mimetype !== 'application/pdf') {
    return next(new AppError('يجب رفع ملف PDF فقط', 400));
  }

  const maxSize = 5 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return next(new AppError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 400));
  }

  const pdfUrl = await uploadPdf(req.file, 'file');

  if (!pdfUrl) {
    return next(new AppError('فشل رفع الملف. يرجى المحاولة مرة أخرى', 500));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { file: pdfUrl },
    message: 'تم رفع الملف بنجاح',
  });
});

export default { uploadImageMethod, uploadFileMethod };
