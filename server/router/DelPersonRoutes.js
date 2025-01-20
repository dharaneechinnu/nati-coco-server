const express = require("express");
const { updateLocation,getDeliveryOrders,getDeliveryLocation,getDeliveryPersonLocation,updateRiderAvailability,findNearestDeliveryPerson, updateDeliveryStatus, getOrderHistory } = require("../Controller/Rider/DeliveryPerson");
const {  getDeliveryPersons } = require("../Controller/ChickenStore/ChickenStoreController");
const {DeliverypersonLogin, DeliverypersonRegister,sendOtp,verifyOtp,resetPassword,resetPasswordConfirm,verifyDocument,getDeliveryPersonDetails,verifyDeliveryPerson } = require('../Controller/Rider/DeliveryAuth')
const router = express.Router();


//Delivery Login Credentials
router.post('/login',DeliverypersonLogin)
router.post('/Register',DeliverypersonRegister)
router.post('/generate-otp',sendOtp)
router.post('/verify-otp',verifyOtp)
router.post('/reset-password',resetPassword)
router.patch('/resetpass-otp',resetPasswordConfirm)
router.post('/Verify-document',verifyDocument)
router.get('/:phonenumber', getDeliveryPersonDetails);
// PUT route to mark delivery person as verified
router.put('/:phonenumber', verifyDeliveryPerson);



router.get('/getDeliveryPerson',getDeliveryPersons);
router.post("/update-location", updateLocation);
router.get("/location/:orderId", getDeliveryPersonLocation);
router.post("/find-nearest", findNearestDeliveryPerson);




// Route to update delivery status
// router.post("/update-delivery-status", updateDeliveryStatus);

// Route to get order history
router.get("/order-history/:userId", getOrderHistory);


router.patch('/availability/:id', updateRiderAvailability);
// Get all orders for a delivery person
router.get('/orders/:deliveryPersonId', getDeliveryOrders);

// Update order status
router.patch('/order/:orderId/status', updateDeliveryStatus);

router.get('/deliveryocation', getDeliveryLocation);

module.exports = router;
