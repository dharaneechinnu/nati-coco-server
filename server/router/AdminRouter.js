require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/AdminMiddleware'); // Import the middleware
const {loginAdmin,registerAdmin } = require('../Controller/AdminController'); // Import controller functions

router.get('/responses/:studentId', getUserResponses);

router.route('/adminlogin').post(loginAdmin);
router.route('/adminregister').post(registerAdmin);


module.exports = router;