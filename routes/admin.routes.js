import express from 'express';
import multer from 'multer';
import adminsController from '../controllers/admins.controller.js';
import verifyToken from '../middlewares/verify.token.js';

const {
  adminRegister,
  adminLogin,
  getAdminData,
  adminForgotPassword,
  verifyOTP,
  resetPasswordAdmin,
  getAllAdmins,
  getOneAdmin,
  deleteOneAdmin,
  changeRoleAdmin,
  updateAdminData,
  toggleAdminBlock,
} = adminsController;

const router = express.Router();
const upload = multer();

router.use(upload.none());

router.get('/check-auth', verifyToken, getAdminData);
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-admin', verifyToken, resetPasswordAdmin);
router.patch('/update-profile', verifyToken, updateAdminData);
router.patch('/block/:id', verifyToken, toggleAdminBlock);
router.get('/', verifyToken, getAllAdmins);
router
  .route('/:id')
  .get(verifyToken, getOneAdmin)
  .patch(verifyToken, changeRoleAdmin)
  .delete(verifyToken, deleteOneAdmin);

export default router;
