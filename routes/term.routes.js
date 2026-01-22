import express from 'express';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';
import termController from '../controllers/term.controller.js';

const { addOneTerm, getAllTerms, getOneTerm, updateTerm, deleteOneTerm } = termController;

const upload = multer();

const router = express.Router();

router.route('/').post(upload.none(), verifyToken, addOneTerm).get(getAllTerms);

router
  .route('/:id')
  .get(getOneTerm)
  .patch(upload.none(), verifyToken, updateTerm)
  .delete(verifyToken, deleteOneTerm);

export default router;
