import express from 'express';
import blogController from '../controllers/blog.controller.js';
import multer from 'multer';
import validateImage from '../middlewares/validate.Image.js';
import verifyToken from '../middlewares/verify.token.js';

const { addOneBlog, getAllBlogs, getOneBlog, deleteOneBlog, updateBlog } = blogController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOneBlog).get(getAllBlogs);

router
  .route('/:id')
  .get(getOneBlog)
  .delete(verifyToken, deleteOneBlog)
  .patch(verifyToken, upload.none(), validateImage, updateBlog);

export default router;
