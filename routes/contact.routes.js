import express from 'express';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';
import contactController from '../controllers/contact.controller.js';

const { addOneContact, getAllContact, getOneContact, deleteOneContact } = contactController;

const upload = multer();

const router = express.Router();

router.route('/').post(upload.none(), addOneContact).get(verifyToken, getAllContact);

router.route('/:id').get(verifyToken, getOneContact).delete(verifyToken, deleteOneContact);

export default router;
