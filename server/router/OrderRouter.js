const express = require("express");
const { getPendingOrders, assignDeliveryPerson, getDeliveryPersonLocation,createOrder,getOrders } = require("../Controller/OrderController");

const router = express.Router();

// Create Order
router.post("/", createOrder);

// Fetch All Orders (Optional)
router.get("/", getOrders);

router.get("/pending", getPendingOrders);

module.exports = router;
