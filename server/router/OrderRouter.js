const express = require("express");
const { createOrder, getOrderAnalytics } = require("../Controller/User/OrderController");

const router = express.Router();

//Place Order
router.post("/placeorder", createOrder);

//Get Order Analytics
router.get("/analytics", getOrderAnalytics);


module.exports = router;
