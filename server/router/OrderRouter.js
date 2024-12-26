const express = require("express");
const { createOrder } = require("../Controller/User/OrderController");

const router = express.Router();

//Place Order
router.post("/placeorder", createOrder);



module.exports = router;
