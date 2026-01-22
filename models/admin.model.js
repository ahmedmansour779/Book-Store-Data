import mongoose from 'mongoose';
import roles from '../utils/constants/admin.roles.js';

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

  block: {
    type: Boolean,
    default: false,
  },

  country: {
    type: String,
    required: true,
    enum: ['egypt', 'Saudi Arabia'],
  },

  role: {
    type: String,
    required: true,
    enum: Object.values(roles),
  },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
