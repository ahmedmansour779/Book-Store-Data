import express from 'express';
import paymentController from '../controllers/payment.controller.js';

const { createPaymentIntent } = paymentController;
const router = express.Router();

router.post('/create', createPaymentIntent);

export default router;
