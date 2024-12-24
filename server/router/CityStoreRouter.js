const express = require('express');
const router = express.Router();
const {CityStoreLogin,addMenuItem,updateMenuItem,deleteMenuItem} = require('../Controller/CityStoreController')


//cityStore Login Router
router.post('/Login',CityStoreLogin);
//cityStore Add Menu Item Router
router.post('/Addmenu',addMenuItem);
//cityStore Update Menu Item Router
router.put('/Updatemenu/:id',updateMenuItem);
//cityStore Delete Menu Item Router
router.delete('/Deletemenu/:id',deleteMenuItem);



module.exports = router;
