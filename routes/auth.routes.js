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
} = require('../controllers/user.controller');
const multer = require('multer');
const verifyOwner = require('../middlewares/verify.owner');
const verifyToken = require('../middlewares/verify.token');
const router = express.Router();
const upload = multer();

router.use(upload.none());

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/forgotPassword').post(forgotPassword);

router.route('/verifyOTP').post(verifyOTP);

router.route('/').get(verifyToken, verifyOwner, getAllUser);

router
  .route('/:id')
  .get(verifyToken, verifyOwner, getOneUser)
  .patch(verifyToken, editProfileData)
  .delete(verifyToken, verifyOwner, deleteOneUser);

module.exports = router;
