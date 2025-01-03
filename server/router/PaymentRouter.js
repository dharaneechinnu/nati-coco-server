const express = require("express");
const { createUpiOrder, getPaymentStatus} = require("../Controller/User/PaymentController");

const router = express.Router();

router.post("/create-upi-order", createUpiOrder);

router.post("/status/:orderId", getPaymentStatus);

module.exports = router;
