const { validationResult } = require("express-validator");
const Courses = require("../models/course.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require('../middlewares/asyncWrapper');
const mongoose = require("mongoose");
const CustomError = require("../utils/customError");

const getAllCourses = asyncWrapper(async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const filter = search.trim()
        ? { title: { $regex: search, $options: "i" } }
        : {};

    const courses = await Courses.find(filter, { "__v": false })
        .skip(skip)
        .limit(limit);

    const total = await Courses.countDocuments(filter);

    if (courses.length === 0) {
        throw CustomError.create(404, "No courses found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            courses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

const getOneCourse = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid course id");
    }

    const course = await Courses.findById(id, { "__v": false });

    if (!course) {
        throw CustomError.create(404, "Course not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { course }
    });
});

const addOneCourse = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    const course = await Courses.create(req.body);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { course }
    });
});

const deleteOneCourse = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid course id");
    }

    const result = await Courses.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
        throw CustomError.create(404, "Course not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});

const deleteAllCourses = asyncWrapper(async (req, res) => {
    const result = await Courses.deleteMany({});
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: `Deleted ${result.deletedCount} courses`
    });
});

const updateCourse = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid course id");
    }

    const course = await Courses.findByIdAndUpdate(id, req.body, { new: true });

    if (!course) {
        throw CustomError.create(404, "Course not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { course }
    });
});

module.exports = {
    getAllCourses,
    getOneCourse,
    addOneCourse,
    deleteOneCourse,
    deleteAllCourses,
    updateCourse
};
