const express = require('express');
const router = express.Router();
const {findNearestStoreAndDisplayMenu,getHelpOrderStoreDetails,PostPreOrder} =  require("../Controller/User/OrderController");

router.get('/nearest', findNearestStoreAndDisplayMenu);

router.post('/helporder',getHelpOrderStoreDetails);

router.post('/preorder',PostPreOrder);

module.exports = router;