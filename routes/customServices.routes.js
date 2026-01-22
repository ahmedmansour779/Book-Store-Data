import express from 'express';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';
import customServiceController from '../controllers/customServices.controller.js';

const {
  addOneCustomServices,
  getAllCustomServices,
  getOneCustomServices,
  deleteOneCustomServices,
} = customServiceController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router
  .route('/')
  .post(verifyToken, upload.none(), addOneCustomServices)
  .get(verifyToken, getAllCustomServices);

router
  .route('/:id')
  .get(verifyToken, getOneCustomServices)
  .delete(verifyToken, deleteOneCustomServices);

export default router;
