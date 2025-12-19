module.exports = (req, res, next) => {
  if (!req.file) return next();

  const allowedTypes = ['application/pdf'];
  const maxSize = 2 * 1024 * 1024;

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Only PDF files are allowed',
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      status: 'fail',
      message: 'PDF file is too large. Maximum allowed size is 2MB',
    });
  }

  next();
};
