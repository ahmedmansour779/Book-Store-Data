module.exports = (req, res, next) => {
  if (!req.file) return next();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Only image files are allowed',
    });
  }

  next();
};
