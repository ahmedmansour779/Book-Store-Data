let express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');
const checkPdf = require('../middlewares/validate.pdf');
const {
  addOneCustomServices,
  getAllCustomServices,
  getOneCustomServices,
  deleteOneCustomServices,
} = require('../controllers/customServices.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router
  .route('/')
  .post(verifyToken, upload.single('file'), checkPdf, addOneCustomServices)
  .get(verifyToken, getAllCustomServices);

router
  .route('/:id')
  .get(verifyToken, getOneCustomServices)
  .delete(verifyToken, deleteOneCustomServices);

module.exports = router;
