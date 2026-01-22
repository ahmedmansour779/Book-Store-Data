import express from 'express';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';
import jobController from '../controllers/job.controller.js';

const { addOneJob, getAllJobs, getOneJob, deleteOneJob, updateJob, applyToJob, getAllJobsForSite } =
  jobController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOneJob).get(verifyToken, getAllJobs);
router.route('/all-jobs-users').get(getAllJobsForSite);

router
  .route('/:id')
  .post(upload.none(), applyToJob)
  .get(verifyToken, getOneJob)
  .delete(verifyToken, deleteOneJob)
  .patch(verifyToken, upload.none(), updateJob);

export default router;
