const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../Controller/User/PaymentController');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;