/* eslint-disable prettier/prettier */
import express from 'express';
import multer from 'multer';
import customServiceControllerType from '../controllers/customServicesTypes.controller.js';
import verifyToken from '../middlewares/verify.token.js';

const { addCustomServicesDetails, addOneCustomServicesTypes, deleteOneCustomServicesTypes, getCustomServicesDetails, getCustomServicesTypes, updateCustomServices, updateOneCustomServicesDetails, deleteOneCustomServicesDetails } = customServiceControllerType
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router
    .route('/')
    .post(upload.none(), verifyToken, addOneCustomServicesTypes)
    .get(getCustomServicesTypes);

router
    .route('/:id')
    .get(getCustomServicesDetails)
    .post(upload.none(), verifyToken, addCustomServicesDetails)
    .patch(upload.none(), verifyToken, updateCustomServices)
    .delete(verifyToken, deleteOneCustomServicesTypes);

router
    .route('/:servicesTypesId/:serviceDetailId')
    .patch(upload.none(), verifyToken, updateOneCustomServicesDetails)
    .delete(verifyToken, deleteOneCustomServicesDetails);

export default router;
