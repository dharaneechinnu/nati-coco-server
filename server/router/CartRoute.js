const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../Controller/CartController');

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCart);
router.post('/remove', removeFromCart);

module.exports = router;
