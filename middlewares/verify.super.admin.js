const CustomError = require("../utils/customError");
const userRole = require("../utils/user.roles");

const verifySuperAdmin = (req, res, next) => {
    if (!req.user) {
        throw CustomError.create(401, "not authenticated");
    }

    if (req.user.data.role !== userRole.superAdmin) {
        throw CustomError.create(403, "only super admin can access this data");
    }

    next();
}

module.exports = verifySuperAdmin;
