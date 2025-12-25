let express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
  applyStandardService,
  getAllStandardServiceAllPrices,
} = require('../controllers/standardService.controller');

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

module.exports = router;
