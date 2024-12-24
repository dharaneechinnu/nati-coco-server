const express = require("express");
const { updateLocation,addDeliveryPerson,getDeliveryPersonLocation,findNearestDeliveryPerson } = require("../Controller/DeliveryPerson");

const router = express.Router();

router.post('/add', addDeliveryPerson);

router.post("/update-location", updateLocation);

router.get("/location/:orderId", getDeliveryPersonLocation);

router.post("/find-nearest", findNearestDeliveryPerson);

module.exports = router;
