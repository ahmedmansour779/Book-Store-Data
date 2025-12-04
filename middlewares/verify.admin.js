const CustomError = require("../utils/customError");
const userRole = require("../utils/user.roles");

const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        throw CustomError.create(401, "not authenticated");
    }

    if (req.user.data.role !== userRole.admin && req.user.data.role !== userRole.superAdmin) {
        throw CustomError.create(403, "only admin can access this data");
    }

    next();
}

module.exports = verifyAdmin;