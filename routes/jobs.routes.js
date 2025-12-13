let express = require('express');
const multer = require('multer');
const validateImage = require('../middlewares/validate.Image');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneJob,
  getAllJobs,
  getOneJob,
  deleteOneJob,
  updateJob,
  applyToJob,
} = require('../controllers/job.controller');
const checkPdf = require('../middlewares/validate.pdf');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router
  .route('/')
  .post(verifyToken, upload.single('image'), validateImage, addOneJob)
  .get(verifyToken, getAllJobs);

router
  .route('/:id')
  .post(upload.single('cv'), checkPdf, applyToJob)
  .get(getOneJob)
  .delete(verifyToken, deleteOneJob)
  .patch(verifyToken, upload.single('image'), validateImage, updateJob);

module.exports = router;
