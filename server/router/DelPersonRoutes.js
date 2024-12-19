const express = require("express");
const { updateLocation,addDeliveryPerson,assignDeliveryPerson,getDeliveryPersonLocation } = require("../Controller/DeliveryPerson");

const router = express.Router();

router.post('/add', addDeliveryPerson);

router.post("/update-location", updateLocation);


router.post("/assign", assignDeliveryPerson);

router.get("/location/:orderId", getDeliveryPersonLocation);

module.exports = router;
