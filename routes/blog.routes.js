let express = require('express');
const {
  addOneBlog,
  getAllBlogs,
  getOneBlog,
  deleteOneBlog,
  updateBlog,
} = require('../controllers/blog.controller');
const multer = require('multer');
const validateImage = require('../middlewares/validate.Image');
const verifyToken = require('../middlewares/verify.token');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOneBlog).get(getAllBlogs);

router
  .route('/:id')
  .get(getOneBlog)
  .delete(verifyToken, deleteOneBlog)
  .patch(verifyToken, upload.single('image'), validateImage, updateBlog);

module.exports = router;
