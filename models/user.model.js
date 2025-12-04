const mongoose = require("mongoose")
const validator = require("validator");
const userRole = require("../utils/user.roles");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'email is not vialed']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [userRole.user, userRole.admin, userRole.superAdmin],
        default: userRole.user
    },
    token: {
        type: String
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/prod/image/upload/ar_1:1,c_auto,g_auto,w_500/r_max/me/rc/portrait-2.png'
    }
});

module.exports = mongoose.model('User', userSchema);