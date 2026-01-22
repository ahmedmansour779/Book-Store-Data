/* eslint-disable prettier/prettier */

import mongoose from 'mongoose';
import { userMessages } from '../constants/index.js';

const serviceDetailSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { 
        _id: true
    }
);

const customServicesTypesSchema = new mongoose.Schema(
    {
        typeService: {
            type: String,
            required: [true, userMessages.typeServiceRequired],
            unique: true,
            enum: ["printing", "design and programming", "marketing"],
            trim: true,
        },
        serviceDetails: {
            type: [serviceDetailSchema],
            required: [true, userMessages.serviceDetailsRequired],
        },
        author: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('customServicesType', customServicesTypesSchema);
