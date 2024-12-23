const express = require("express");
const { addToCart, getCart, removeFromCart } = require("../Controller/CartController");

const router = express.Router();

router.post("/add", addToCart);

router.get("/:userid", getCart);

router.post("/deleted", removeFromCart);

module.exports = router;
