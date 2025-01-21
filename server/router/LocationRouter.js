const express = require('express');
const{PostUserLiveLocation,postUserAddress,GetLiveLocation} = require('../Controller/User/LocationController');

const router = express.Router();

router.patch('/live-location',PostUserLiveLocation);

router.get('/live-location/:userId', GetLiveLocation);

router.post('/address',postUserAddress);

module.exports = router;

