const express = require("express");
const { createOrder, getOrderAnalytics,verifyAndComplete,markOrderReadyAndAssignDelivery } = require("../Controller/User/OrderController");

const router = express.Router();

//Place Order
router.post("/placeorder", createOrder);

//Get Order Analytics
router.get("/analytics", getOrderAnalytics);

router.post('/markreadyAndAssign', markOrderReadyAndAssignDelivery);
router.post('/verifyandcomplete', verifyAndComplete);


module.exports = router;
