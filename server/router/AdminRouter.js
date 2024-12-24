require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/AdminMiddleware');
const {loginAdmin,AddCityStoreAdmin } = require('../Controller/AdminController');

//Admin Login Router
router.route('/login').post(loginAdmin);

//Add CityStore Admin router 
router.route('/addcitystore').post(AddCityStoreAdmin);


module.exports = router;