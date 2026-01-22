import express from 'express';
import multer from 'multer';
import verifyToken from '../middlewares/verify.token.js';
import portfolioController from '../controllers/portfolio.controller.js';

const { addOnePortfolio, getAllPortfolio, getOnePortfolio, updatePortfolio, deleteOnePortfolio } =
  portfolioController;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.route('/').post(verifyToken, upload.none(), addOnePortfolio).get(getAllPortfolio);

router
  .route('/:id')
  .get(getOnePortfolio)
  .patch(verifyToken, upload.none(), updatePortfolio)
  .delete(verifyToken, deleteOnePortfolio);

export default router;
