import express from 'express';
import multer from 'multer';
import verifyToken from '../../middlewares/verify.token.js';
import printStandardServiceController from '../../controllers/standardServices/print.standardService.controller.js';

const {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
  getAllStandardServiceAllPrices,
} = printStandardServiceController;

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
