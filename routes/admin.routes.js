const express = require('express');
const multer = require('multer');
const {
  adminRegister,
  adminLogin,
  getAdminData,
  adminForgotPassword,
  verifyOTP,
  resetPasswordAdmin,
} = require('../controllers/admins.controller');
const verifyToken = require('../middlewares/verify.token');

const router = express.Router();
const upload = multer();

router.use(upload.none());

router.get('/check-auth', verifyToken, getAdminData);
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-admin', verifyToken, resetPasswordAdmin);

module.exports = router;
