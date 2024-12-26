const express = require('express');
const router = express.Router();
const {findNearestStoreAndDisplayMenu} =  require("../Controller/User/OrderController");

router.get('/nearest', findNearestStoreAndDisplayMenu);

module.exports = router;