const express = require('express');
const { uploadImageMethod, uploadFileMethod } = require('../controllers/upload.controller');
const multer = require('multer');
const validateImage = require('../middlewares/validate.Image');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/image', upload.single('image'), validateImage, uploadImageMethod);
router.post('/file', upload.single('file'), uploadFileMethod);

module.exports = router;
