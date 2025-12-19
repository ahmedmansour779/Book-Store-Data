let express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneJob,
  getAllJobs,
  getOneJob,
  deleteOneJob,
  updateJob,
  applyToJob,
} = require('../controllers/job.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOneJob).get(verifyToken, getAllJobs);

router
  .route('/:id')
  .post(upload.none(), applyToJob)
  .get(verifyToken, getOneJob)
  .delete(verifyToken, deleteOneJob)
  .patch(verifyToken, upload.none(), updateJob);

module.exports = router;
