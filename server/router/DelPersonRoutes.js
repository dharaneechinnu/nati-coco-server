const express = require("express");
const { updateLocation,getDeliveryPersonLocation,findNearestDeliveryPerson, updateDeliveryStatus, getOrderHistory } = require("../Controller/Rider/DeliveryPerson");
const { addDeliveryPerson, getDeliveryPersons } = require("../Controller/ChickenStore/ChickenStoreController");

const router = express.Router();

router.post('/add', addDeliveryPerson);
router.get('/getDeliveryPerson',getDeliveryPersons);

router.post("/update-location", updateLocation);

router.get("/location/:orderId", getDeliveryPersonLocation);

router.post("/find-nearest", findNearestDeliveryPerson);

// Route to update delivery status
router.post("/update-delivery-status", updateDeliveryStatus);

// Route to get order history
router.get("/order-history/:userId", getOrderHistory);

module.exports = router;
