const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cv: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  created: {
    type: String,
  },
  updated: {
    type: String,
  },
  employmentType: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  applications: {
    type: [applicationSchema],
    default: [],
  },
});

module.exports = mongoose.model('Job', jobSchema);
