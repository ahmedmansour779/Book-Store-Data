const express = require('express');
const {
  adminRegister,
  adminLogin,
  getAdminData,
  adminForgotPassword,
  verifyOTP,
} = require('../controllers/admins.controller');
const verifyToken = require('../middlewares/verify.token');
const router = express.Router();

router.get('/check-auth', verifyToken, getAdminData);
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/verify-otp', verifyOTP);

module.exports = router;
