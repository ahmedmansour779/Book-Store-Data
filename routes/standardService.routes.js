let express = require('express');
const multer = require('multer');
const validateImage = require('../middlewares/validate.Image');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneStandardService,
  getAllStandardService,
  updateStandardService,
  deleteOneStandardService,
} = require('../controllers/standardService.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router
  .route('/')
  .post(verifyToken, upload.single('image'), validateImage, addOneStandardService)
  .get(getAllStandardService);

router
  .route('/:id')
  .patch(verifyToken, upload.single('image'), validateImage, updateStandardService)
  .delete(verifyToken, deleteOneStandardService);
// .post(upload.single("cv"), checkPdf, applyToJob)

module.exports = router;
