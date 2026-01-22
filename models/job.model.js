import mongoose from 'mongoose';
import { jobsMessages } from '../constants/index.js';

const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, jobsMessages.fullName],
    },
    country: {
      type: String,
      required: [true, jobsMessages.country],
    },
    state: {
      type: String,
      required: [true, jobsMessages.state],
    },
    gender: {
      type: String,
      required: [true, jobsMessages.gender],
      enum: ['male', 'female', 'other'],
    },
    email: {
      type: String,
      required: [true, jobsMessages.email],
    },
    phone: {
      type: String,
      required: [true, jobsMessages.phone],
    },
    cv: {
      type: String,
      required: [true, jobsMessages.cv],
    },
    message: {
      type: String,
      required: false,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, jobsMessages.titleIsRequire],
    },
    description: {
      type: String,
      required: [true, jobsMessages.descriptionIsRequire],
    },
    image: {
      type: String,
      required: [true, jobsMessages.imageIsRequire],
    },
    created: {
      type: String,
    },
    employmentType: {
      type: String,
      required: [true, jobsMessages.employmentType],
    },
    experience: {
      type: String,
      required: [true, jobsMessages.experience],
    },
    author: {
      type: String,
    },
    applications: {
      type: [applicationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Job', jobSchema);
