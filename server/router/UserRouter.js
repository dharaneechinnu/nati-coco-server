const express = require('express');
const router = express.Router();
const {findNearestStoreAndDisplayMenu,getHelpOrderStoreDetails} =  require("../Controller/User/OrderController");

router.get('/nearest', findNearestStoreAndDisplayMenu);


router.post('/helporder',getHelpOrderStoreDetails)

module.exports = router;