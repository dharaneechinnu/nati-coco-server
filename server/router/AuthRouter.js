require('dotenv').config();
const express = require('express');
const router = express.Router();


router.route('/login').post(require('../Controller/AuthController').login);
router.route('/Register').post(require('../Controller/AuthController').register);

router.route('/generate-otp').post(require('../Controller/AuthController').gtpOtps);
router.route('/verify-otp').post(require('../Controller/AuthController').Verifyotp);
router.route('/reset-password').post(require('../Controller/AuthController').resetPassword);
router.route('/resetpass-otp').patch(require('../Controller/AuthController').respassword);



module.exports = router;