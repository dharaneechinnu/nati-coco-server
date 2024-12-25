const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/AdminMiddleware');
const {loginAdmin,AddChickenStore,getCityOwners} = require('../Controller/Admin/AdminController');

// GET route to fetch all city owners
router.get('/cityowners', getCityOwners);

//Admin Login Router
router.route('/login').post(loginAdmin);

//Add CityStore Admin router 
router.route('/addcitystore').post(AddChickenStore);


module.exports = router;