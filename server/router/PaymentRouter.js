const express = require("express");
const { createOrder, verifyPayment } = require("../Controller/User/PaymentController");

const router = express.Router();

router.post("/orders", createOrder);

router.post("/verify", verifyPayment);

module.exports = router;
