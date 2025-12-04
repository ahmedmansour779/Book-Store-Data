const asyncWrapper = require("../middlewares/asyncWrapper");
const Users = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const CustomError = require("../utils/customError");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const generateToken = require("../utils/generate.token");
const { default: mongoose } = require("mongoose");
const cloudinary = require("../utils/cloudinary");
const uploadImage = require("../utils/uploadImage");

const getAllUsers = asyncWrapper(async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const filter = search.trim()
        ? { title: { $regex: search, $options: "i" } }
        : {};

    const users = await Users.find(filter, { "__v": false, "password": false })
        .skip(skip)
        .limit(limit);

    const total = await Users.countDocuments(filter);

    console.log(users);


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
})

const register = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    const { firstName, lastName, email, password } = req.body


    const oldUser = await Users.findOne({ email })

    if (oldUser) {
        throw CustomError.create(400, "email is exist");
    }

    let avatarUrl;
    if (req.file) {
        avatarUrl = await uploadImage(req.file, "users", email);
    }


    const hashingPassword = await bcryptjs.hash(password, 10)


    const user = new Users({
        firstName, lastName, email,
        password: hashingPassword,
        avatar: avatarUrl ? avatarUrl : "https://res.cloudinary.com/prod/image/upload/ar_1:1,c_auto,g_auto,w_500/r_max/me/rc/portrait-2.png"
    });

    await user.save();

    const token = await generateToken({ id: user._id, type: user.type, email: user.email, password: user.password }, "10m")
    user.token = token

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { user }
    });
});

const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log(email, password);

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

    if (matchPassword && user) {
        const token = await generateToken(user, "1h")
        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            message: "login success",
            data: { token }
        });
    }

    throw CustomError.create(500, "server is not accepted");
})

const setAdmin = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "invalid user id");
    }

    const user = await Users.findById(id)
    if (!user) {
        throw CustomError.create(404, "user not found");
    }

    user.type = "admin";

    await user.save();
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: `${user.firstName} is admin`,
        data: { user }
    });
})

const deleteUser = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid user id");
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

const updateUser = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid user id");
    }

    const user = await Users.findById(id, { "__v": false, "role": false });
    if (!user) {
        throw CustomError.create(404, "user not found");
    }

    const allowedFields = ['email', 'password', 'firstName', 'lastName', 'avatar'];

    const bodyKeys = Object.keys(req.body);

    const isBodyValid = bodyKeys.every(key => allowedFields.includes(key));

    if (!isBodyValid) {
        throw CustomError.create(400, "data not accepted");
    }

    let avatarUrl;

    if (req.file) {
        avatarUrl = await uploadImage(req.file, "users", user.email);
    }

    for (let key of Object.keys(req.body)) {

        if (!allowedFields.includes(key)) continue;

        if (req.body[key].trim() === "") continue;

        if (key === "password") {
            user.password = await bcryptjs.hash(req.body.password, 10);
        } else {
            user[key] = req.body[key].trim();
        }
    }

    if (avatarUrl) {
        user.avatar = avatarUrl;
    }

    await user.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { user }
    });
});

module.exports = {
    getAllUsers,
    register,
    login,
    setAdmin,
    deleteUser,
    updateUser
}