const asyncWrapper = require('../middlewares/async.wrapper');
const httpStatusText = require('../utils/http.status.text');
const uploadImage = require('../utils/upload.Image');
const AppError = require('../utils/app.error');

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

module.exports = uploadImageMethod;
