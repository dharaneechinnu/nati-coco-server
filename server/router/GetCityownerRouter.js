const express = require('express');
const router = express.Router();
const { getCityOwners } = require('../Controller/GetCityowners');

// GET route to fetch all city owners
router.get('/cityowners', getCityOwners);

module.exports = router;
