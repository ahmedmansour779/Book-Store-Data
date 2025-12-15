const express = require('express');
const { createPaymentIntent } = require('../controllers/payment.controller');
const router = express.Router();

router.post('/create', createPaymentIntent);

module.exports = router;
