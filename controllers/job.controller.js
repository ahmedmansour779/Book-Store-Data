const { validationResult } = require("express-validator");
const Jobs = require("../models/job.model");
const httpStatusText = require("../utils/http.status.text");
const asyncWrapper = require('../middlewares/async.wrapper');
const CustomError = require("../utils/custom.error");
const formatDate = require("../utils/format.date");
const uploadImage = require("../utils/upload.Image");
const mongoose = require("mongoose");
const userRole = require("../utils/user.roles");

const addOneJob = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    if (req.user.data.role !== userRole.humanRelations) {
        throw CustomError.create(400, "you can not add job");
    }

    let image;
    if (req.file) {
        image = await uploadImage(req.file, "Jobs", req.body.title);
        req.body.image = image
    }


    if (!req.body.image) {
        throw CustomError.create(400, "image is required");
    }

    if (!req.body.created) {
        req.body.created = formatDate();
    }

    req.body.author = req.user.data._id


    const job = await Jobs.create(req.body);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { job }
    });
});

const getAllJobs = asyncWrapper(async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = search.trim()
        ? { title: { $regex: search, $options: "i" } }
        : {};

    const jobs = await Jobs.find(filter, { "__v": false })
        .skip(skip)
        .limit(limit);

    const total = await Jobs.countDocuments(filter);

    if (jobs.length === 0) {
        throw CustomError.create(404, "No jobs found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            jobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
})

const getOneJob = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid Job id");
    }

    const job = await Jobs.findById(id, { "__v": false });

    if (!job) {
        throw CustomError.create(404, "Job not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { job }
    });
});

const deleteOneJob = asyncWrapper(async (req, res) => {
    if (req.user.data.role !== userRole.owner) {
        throw CustomError.create(400, "you can not delete Job");
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, "Invalid Job id");
    }

    const result = await Jobs.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
        throw CustomError.create(404, "Job not found");
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});

const updateJob = asyncWrapper(async (req, res) => {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    const job = await Jobs.findById(id);
    if (!job) {
        throw CustomError.create(404, "Job not found");
    }
    if (job.author !== req.user.data._id) {
        throw CustomError.create(400, "you can not update this job");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.data._id)) {
        throw CustomError.create(400, "Invalid user id");
    }

    if (job.author !== req.user.data._id) {
        throw CustomError.create(400, "you can not update this Jobs");
    }

    if (!req.body.updated) {
        req.body.updated = formatDate();
    }

    if (req.file) {
        const image = await uploadImage(req.file, "Jobs", req.body.title || job.title);
        req.body.image = image;
    }

    Object.keys(req.body).forEach(key => {
        job[key] = req.body[key];
    });

    await job.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { job }
    });
});

module.exports = {
    addOneJob,
    getAllJobs,
    getOneJob,
    deleteOneJob,
    updateJob
};