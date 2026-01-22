import express from 'express';
import userController from '../controllers/user.controller.js';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';

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
  toggleUserBlock,
  verifyUser,
} = userController;

const router = express.Router();
const upload = multer();

router.use(upload.none());

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyOTP').post(verifyOTP);
router.route('/verify-user').post(verifyToken, verifyUser);
router.route('/reset-password').post(verifyToken, resetPassword);
router.route('/block/:id').patch(verifyToken, toggleUserBlock);
router.route('/').get(verifyToken, getAllUser).patch(verifyToken, editProfileData);
router.route('/:id').get(verifyToken, getOneUser).delete(verifyToken, deleteOneUser);

export default router;
