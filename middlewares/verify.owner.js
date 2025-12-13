const CustomError = require('../utils/custom.error');
const userRole = require('../utils/user.roles');

const verifyOwner = (req, res, next) => {
  if (!req.user) {
    throw CustomError.create(401, 'not authenticated');
  }

  if (req.user.data.role !== userRole.owner) {
    //here
    throw CustomError.create(403, 'only owners can access this data');
  }

  next();
};

module.exports = verifyOwner;
