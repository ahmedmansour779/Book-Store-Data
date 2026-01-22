import express from 'express';
import multer from 'multer';
import verifyToken from '../../middlewares/verify.token.js';
import programmingStandardServiceController from '../../controllers/standardServices/programming.standardService.controller.js';

const {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
  getAllStandardServiceAllPrices,
} = programmingStandardServiceController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').get(getAllStandardService);

router
  .route('/all-prices')
  .get(verifyToken, getAllStandardServiceAllPrices)
  .post(verifyToken, upload.none(), addOneStandardService);

router
  .route('/all-prices/:id')
  .patch(verifyToken, upload.none(), updateStandardService)
  .delete(verifyToken, deleteOneStandardService)
  .post(applyStandardService);

export default router;
