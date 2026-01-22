import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import multer from 'multer';
import validateImage from '../middlewares/validate.Image.js';

const { uploadImageMethod, uploadFileMethod } = uploadController;
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/image', upload.single('image'), validateImage, uploadImageMethod);
router.post('/file', upload.single('file'), uploadFileMethod);

export default router;
