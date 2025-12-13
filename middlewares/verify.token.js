const jwt = require('jsonwebtoken');
const CustomError = require('../utils/custom.error');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    throw CustomError.create(400, 'token is required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_CODE);
    req.user = decoded;
    next();
  } catch (err) {
    throw CustomError.create(400, 'token expert');
  }
};

module.exports = verifyToken;
