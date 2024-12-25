const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/AdminMiddleware');
const {loginAdmin,AddCityStoreAdmin } = require('../Controller/AdminController');
const { getCityOwners } = require('../Controller/AdminController');

//Admin Login Router
router.route('/login').post(loginAdmin);

//Add CityStore Admin router 
router.route('/addcitystore').post(AddCityStoreAdmin);


// GET route to fetch all city owners
router.get('/cityowners', getCityOwners);

module.exports = router;