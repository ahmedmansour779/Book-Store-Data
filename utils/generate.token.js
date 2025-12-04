const jwt = require("jsonwebtoken")

module.exports = async (data, exp) => {
    const token = await jwt.sign({ data }, process.env.JWT_SECRET_CODE, { expiresIn: exp })
    return token
}