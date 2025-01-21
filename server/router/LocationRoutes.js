const express = require('express');
const router = express.Router();
const { getDeliveryLocation } = require('../Controller/Rider/DeliveryPerson');

// Define the route
router.post('/location', getDeliveryLocation);

module.exports = router;
