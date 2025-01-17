const express = require("express");
const { createOrder, getOrderAnalytics,verifyAndComplete,markOrderReady } = require("../Controller/User/OrderController");

const router = express.Router();

//Place Order
router.post("/placeorder", createOrder);

//Get Order Analytics
router.get("/analytics", getOrderAnalytics);

router.post('/markready', markOrderReady);
router.post('/verifyandcomplete', verifyAndComplete);


module.exports = router;
