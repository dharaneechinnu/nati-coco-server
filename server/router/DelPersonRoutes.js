const express = require("express");
const { updateLocation,getDeliveryPersonLocation,findNearestDeliveryPerson } = require("../Controller/Rider/DeliveryPerson");
const { addDeliveryPerson } = require("../Controller/ChickenStore/ChickenStoreController");

const router = express.Router();

router.post('/add', addDeliveryPerson);

router.post("/update-location", updateLocation);

router.get("/location/:orderId", getDeliveryPersonLocation);

router.post("/find-nearest", findNearestDeliveryPerson);

module.exports = router;
