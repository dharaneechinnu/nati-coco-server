const express = require("express");
const { createOrder, verifyPayment } = require("../Controller/PaymentController");

const router = express.Router();

// Create a Razorpay order
router.post("/orders", createOrder);

// Verify Razorpay payment
router.post("/verify", verifyPayment);

module.exports = router;
