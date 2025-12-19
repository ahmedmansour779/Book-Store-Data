const express = require('express');
const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  getOneUser,
  editProfileData,
  getAllUser,
  deleteOneUser,
  resetPassword,
} = require('../controllers/user.controller');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');

const router = express.Router();
const upload = multer();

router.use(upload.none());

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyOTP').post(verifyOTP);
router.route('/reset-password').post(verifyToken, resetPassword);
router.route('/').get(verifyToken, getAllUser).patch(verifyToken, editProfileData);
router.route('/:id').get(verifyToken, getOneUser).delete(verifyToken, deleteOneUser);

module.exports = router;
