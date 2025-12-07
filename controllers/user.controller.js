const { validationResult } = require("express-validator");
const CustomError = require("../utils/custom.error");
const Users = require("../models/user.model");
const httpStatusText = require("../utils/http.status.text");
const asyncWrapper = require("../middlewares/async.wrapper");
const bcryptjs = require("bcryptjs");
const generateToken = require("../utils/generate.token");
const { sendOTP } = require("../utils/sendOTP");
const OTP = require("../models/otp.model");
const { default: mongoose } = require("mongoose");
const userRole = require("../utils/user.roles");

const register = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    const { name, phone, whatsapp, favoriteContact, companyName, email, password } = req.body

    const oldUser = await Users.findOne({ email })

    if (oldUser) {
        throw CustomError.create(400, "email is exist");
    }

    const hashingPassword = await bcryptjs.hash(password, 10)

    const user = new Users({
        email, name, phone, whatsapp, favoriteContact, companyName,
        password: hashingPassword,
    });

    await user.save();

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { user }
    });
});

const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw CustomError.create(400, "email and password is required");
    }

    const user = await Users.findOne({ email })

    if (!user) {
        throw CustomError.create(400, "email is not true");
    }

    const matchPassword = await bcryptjs.compare(password, user.password)
    if (!matchPassword) {
        throw CustomError.create(400, "password is not accepted");
    }

    const token = await generateToken(user, "24h")
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "login success",
        data: { token }
    });
});

const forgotPassword = asyncWrapper(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw CustomError.create(400, "email is required");
    }

    const user = await Users.findOne({ email }) // 

    if (!user) {
        throw CustomError.create(400, "email is not found");
    }

    const otp = await sendOTP(email);

    await OTP.create({
        email,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // بعد 10 دقايق
    });

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "OTP sent",
        data: null
    });
});

const verifyOTP = asyncWrapper(async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
        email,
        expiresAt: { $gt: Date.now() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        throw CustomError.create(400, "OTP expired or not found");
    }

    if (otpRecord.otp !== otp) {
        throw CustomError.create(400, "Invalid OTP");
    }
    await OTP.deleteOne({ _id: otpRecord._id });
    const user = await Users.findOne({ email })
    const token = await generateToken(user, "24h")

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "OTP verified successfully",
        data: { token, id: user.id }
    });
});

const getAllUser = asyncWrapper(async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = search.trim()
        ? { title: { $regex: search, $options: "i" } }
        : {};

    if (req.user.data.role !== userRole.owner) {
        throw CustomError.create(400, "you can not show all users");
    }

    const users = await Users.find(filter, { "__v": false })
        .skip(skip)
        .limit(limit);

    const total = await Users.countDocuments(filter);

    if (users.length === 0) {
        throw CustomError.create(404, "No users found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

const getOneUser = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid user id");
    }

    if (req.user.data.role !== userRole.owner) {
        throw CustomError.create(400, "you can not show this user");
    }

    const user = await Users.findById(id, { "__v": false, "password": false });

    if (!user) {
        throw CustomError.create(404, "user not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { user }
    });
});

const editProfileData = asyncWrapper(async (req, res) => {
    const id = req.params.id;
    const { password, role, email, name, phone, whatsapp, favoriteContact, companyName } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid blog id");
    }

    const user = await Users.findById(id, { "__v": false });

    if (!user) {
        throw CustomError.create(404, "user not found");
    }

    const isOwner = req.user.data.role === userRole.owner;
    const isSameUser = req.user.data.email === user.email;

    if (isSameUser) {
        if (role && role !== user.role) {
            return res.status(403).json({
                status: httpStatusText.FAIL,
                message: "You cannot change your role"
            });
        }

        let hashedPassword = user.password;
        if (password && password.trim() !== "") {
            hashedPassword = await bcryptjs.hash(password, 10);
        }

        const emailExists = await Users.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                status: httpStatusText.FAIL,
                message: "Email already in use"
            });
        }

        user.password = hashedPassword;
        user.email = email || user.email;
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.whatsapp = whatsapp || user.whatsapp;
        user.favoriteContact = favoriteContact || user.favoriteContact;
        user.companyName = companyName || user.companyName;

        await user.save();

        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: { user }
        });
    }

    if (isOwner) {
        if (!role) {
            return res.status(400).json({
                status: httpStatusText.FAIL,
                message: "Owner can only update the role field"
            });
        }

        user.role = role || user.role

        await user.save();
        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: { user }
        });
    }

    res.status(403).json({
        status: httpStatusText.FAIL,
        message: "You do not have permission to edit this profile"
    });
});

const deleteOneUser = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid user id");
    }

    if (req.user.data.role !== userRole.owner) {
        throw CustomError.create(400, "you can not delete this user");
    }

    const result = await Users.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
        throw CustomError.create(404, "user not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});

module.exports = {
    register,
    login,
    forgotPassword,
    verifyOTP,
    getAllUser,
    getOneUser,
    editProfileData,
    deleteOneUser
};
