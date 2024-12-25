const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/AdminMiddleware');
<<<<<<< HEAD
const {loginAdmin,AddCityStoreAdmin } = require('../Controller/AdminController');
const { getCityOwners } = require('../Controller/AdminController');
=======
const {loginAdmin,AddChickenStore,getCityOwners} = require('../Controller/Admin/AdminController');

// GET route to fetch all city owners
router.get('/cityowners', getCityOwners);
>>>>>>> 5721e8a83444ef0f065ce1a7e3b542f69f2fb21c

//Admin Login Router
router.route('/login').post(loginAdmin);

//Add CityStore Admin router 
router.route('/addcitystore').post(AddChickenStore);


// GET route to fetch all city owners
router.get('/cityowners', getCityOwners);

module.exports = router;