import express from 'express';
import multer from 'multer';
import validateImage from '../middlewares/validate.Image.js';
import verifyToken from '../middlewares/verify.token.js';
import testimonialsController from '../controllers/testimonials.controller.js';

const {
  addOneTestimonials,
  getAllTestimonials,
  getOneTestimonial,
  updateTestimonial,
  deleteOneTestimonial,
} = testimonialsController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOneTestimonials).get(getAllTestimonials);

router
  .route('/:id')
  .get(getOneTestimonial)
  .patch(verifyToken, upload.single('image'), validateImage, updateTestimonial)
  .delete(verifyToken, deleteOneTestimonial);

export default router;
