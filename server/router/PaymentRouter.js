<<<<<<< HEAD
const express = require('express');
=======
const express = require("express");
const { createOrder, verifyPayment } = require("../Controller/User/PaymentController");

>>>>>>> f75e115691b3fb7352480061f821c720cee01fa2
const router = express.Router();
const { createOrder, verifyPayment } = require('../Controller/User/PaymentController');

<<<<<<< HEAD
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

=======
router.post("/orders", createOrder);

router.post("/verify", verifyPayment);

>>>>>>> f75e115691b3fb7352480061f821c720cee01fa2
module.exports = router;