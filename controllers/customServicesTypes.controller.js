import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import asyncWrapper from '../middlewares/async.wrapper.js';
import CustomServicesTypes from '../models/customServices.types.model.js';
import adminRole from '../utils/constants/admin.roles.js';
import * as httpStatusText from '../utils/constants/http.status.text.js';
import CustomError from '../utils/errors/custom.error.js';
import { CustomServicesMessages } from '../constants/index.js';

const addOneCustomServicesTypes = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notAddAccessibility);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    let { typeService, serviceDetails } = req.body;

    const isExist = await CustomServicesTypes.findOne({ typeService });
    if (isExist) {
        throw CustomError.create(400, CustomServicesMessages.serviceTypeExist);
    }

    // 👇 form-data → JSON
    if (typeof serviceDetails === 'string') {
        try {
            serviceDetails = JSON.parse(serviceDetails);
        } catch {
            throw CustomError.create(400, 'serviceDetails must be a valid JSON array');
        }
    }

    // 👇 لازم Array
    if (!Array.isArray(serviceDetails)) {
        throw CustomError.create(400, 'serviceDetails must be an array');
    }

    // 👇 validation الجديدة
    if (
        !serviceDetails.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.value === 'string' &&
                item.value.trim()
        )
    ) {
        throw CustomError.create(
            400,
            'serviceDetails must be an array of objects with non-empty value'
        );
    }

    const customServicesTypes = await CustomServicesTypes.create({
        typeService,
        serviceDetails,
        author: req.user.id,
    });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { customServicesTypes },
        message: CustomServicesMessages.addSuccess,
    });
});

const addCustomServicesDetails = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notAddAccessibility);
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, CustomServicesTypes.invalidBlogId);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw CustomError.create(400, errors.errors[0].msg);
    }

    let { serviceDetails } = req.body;

    if (typeof serviceDetails === 'string') {
        try {
            serviceDetails = JSON.parse(serviceDetails);
        } catch {
            throw CustomError.create(400, 'serviceDetails must be a valid JSON array');
        }
    }

    if (!Array.isArray(serviceDetails)) {
        throw CustomError.create(400, 'serviceDetails must be an array');
    }

    if (
        !serviceDetails.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.value === 'string' &&
                item.value.trim()
        )
    ) {
        throw CustomError.create(
            400,
            'serviceDetails must be an array of objects with non-empty value'
        );
    }

    const customServicesType = await CustomServicesTypes.findById(id);
    if (!customServicesType) {
        throw CustomError.create(404, 'Custom Service Type not found');
    }

    customServicesType.serviceDetails.push(...serviceDetails);

    await customServicesType.save();

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { customServicesType },
        message: CustomServicesMessages.addSuccess,
    });
});

const getCustomServicesTypes = asyncWrapper(async (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = search.trim() ? { title: { $regex: search, $options: 'i' } } : {};

    const typeServices = await CustomServicesTypes.find(filter, {
        __v: false,
        serviceDetails: false,
        author: false,
        createdAt: false,
        updatedAt: false,
    })
        .skip(skip)
        .limit(limit);

    const total = await CustomServicesTypes.countDocuments(filter);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            typeServices,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
});

const getCustomServicesDetails = asyncWrapper(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, CustomServicesTypes.invalidBlogId);
    }

    let CustomServicesDetails = await CustomServicesTypes.findById(id, { __v: false });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: CustomServicesDetails
            ? { CustomServicesDetails: CustomServicesDetails.serviceDetails }
            : null,
    });
});

const updateCustomServices = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notAddAccessibility);
    }
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, CustomServicesTypes.invalidBlogId);
    }

    let { typeService, serviceDetails } = req.body;

    let CustomServicesDetails = await CustomServicesTypes.findById(id, { __v: false });

    if (!CustomServicesDetails) {
        throw CustomError.create(404, 'Custom Service Type not found');
    }

    if (typeService) {
        CustomServicesDetails.typeService = typeService;
    }

    if (serviceDetails) {
        if (typeof serviceDetails === 'string') {
            try {
                serviceDetails = JSON.parse(serviceDetails);
            } catch {
                throw CustomError.create(400, 'serviceDetails must be a valid JSON array');
            }
        }

        // 👇 لازم Array
        if (!Array.isArray(serviceDetails)) {
            throw CustomError.create(400, 'serviceDetails must be an array');
        }

        // 👇 validation الجديدة
        if (
            !serviceDetails.every(
                (item) =>
                    typeof item === 'object' &&
                    item !== null &&
                    typeof item.value === 'string' &&
                    item.value.trim()
            )
        ) {
            throw CustomError.create(
                400,
                'serviceDetails must be an array of objects with non-empty value'
            );
        }
        CustomServicesDetails.serviceDetails = serviceDetails;
    }

    await CustomServicesDetails.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: CustomServicesDetails,
        message: CustomServicesMessages.editSuccess,
    });
});

const deleteOneCustomServicesTypes = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notDeleteAccessibility);
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw CustomError.create(400, CustomServicesMessages.invalidId);
    }

    const result = await CustomServicesTypes.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
        throw CustomError.create(404, CustomServicesMessages.notFound);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
        message: CustomServicesMessages.deleteSuccess,
    });
});

const updateOneCustomServicesDetails = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notDeleteAccessibility);
    }

    const { servicesTypesId, serviceDetailId } = req.params
    let { serviceDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(servicesTypesId) || !mongoose.Types.ObjectId.isValid(serviceDetailId)) {
        throw CustomError.create(400, CustomServicesMessages.invalidId);
    }

    const result = await CustomServicesTypes.findOne(
        {
            _id: servicesTypesId,
            'serviceDetails._id': serviceDetailId,
        },
        {
            serviceDetails: {
                $elemMatch: { _id: serviceDetailId },
            },
        }
    );

    result.serviceDetails[0].value = serviceDetails
    await result.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: result,
        message: CustomServicesMessages.editSuccess,
    });
});

const deleteOneCustomServicesDetails = asyncWrapper(async (req, res) => {
    if (req.user.role !== adminRole.admin) {
        throw CustomError.create(400, CustomServicesMessages.notDeleteAccessibility);
    }

    const { servicesTypesId, serviceDetailId } = req.params

    if (!mongoose.Types.ObjectId.isValid(servicesTypesId) || !mongoose.Types.ObjectId.isValid(serviceDetailId)) {
        throw CustomError.create(400, CustomServicesMessages.invalidId);
    }

    const result = await CustomServicesTypes.updateOne(
        { _id: servicesTypesId },
        {
            $pull: {
                serviceDetails: { _id: serviceDetailId },
            },
        }
    );

    if (result.modifiedCount === 0) {
        throw CustomError.create(404, CustomServicesMessages.notFound);
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
        message: CustomServicesMessages.deleteSuccess,
    });
});

export default {
    addOneCustomServicesTypes,
    getCustomServicesTypes,
    getCustomServicesDetails,
    addCustomServicesDetails,
    updateCustomServices,
    deleteOneCustomServicesTypes,
    updateOneCustomServicesDetails,
    deleteOneCustomServicesDetails,
};
