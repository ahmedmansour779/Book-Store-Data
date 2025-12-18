const mongoose = require('mongoose');
const { admin, humanRelations, writer } = require('../utils/user.roles');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: [admin, humanRelations, writer],
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
