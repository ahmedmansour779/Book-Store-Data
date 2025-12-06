const mongoose = require("mongoose")
const validator = require("validator");
const userRole = require("../utils/user.roles");
const favoriteContact = require("../utils/favorite.contact");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return validator.isEmail(v) && v.toLowerCase().endsWith("@gmail.com");
            },
            message: "Email must be a valid Gmail address"
        }
    },
    password: {
        type: String,
        required: true
    },
    favoriteContact: {
        type: String,
        required: true,
        enum: [favoriteContact.email, favoriteContact.phone, favoriteContact.whatsapp]
    },
    companyName: {
        type: String,
    },
    role: {
        type: String,
        enum: [userRole.user, userRole.humanRelations, userRole.owner, userRole.writer],
        default: userRole.user
    }
});

module.exports = mongoose.model('User', userSchema);