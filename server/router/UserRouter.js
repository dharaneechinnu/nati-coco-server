const express = require('express');
const router = express.Router();
const {findNearestStoreAndDisplay} =  require("../Controller/User/OrderController");

router.get('/nearest', findNearestStoreAndDisplay);

module.exports = router;