<<<<<<< HEAD
const Cart = require("../models/AddToCart");

const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {

    let cart = await Cart.findOne({ userId });

    if (cart) {
   
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        
        cart.items[itemIndex].quantity += quantity;
      } else {
       
        cart.items.push({ productId, quantity });
      }
    } else {
  
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart successfully!", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Cart not found!" });
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const removeFromCart = async (req, res) => {
=======
const Cart = require('../models/CartModel');

// Add an item to the cart
exports.addToCart = async (req, res) => {
  const { userId, productId, name, quantity, price } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, name, quantity, price });
    }

    cart.calculateTotalPrice();
    await cart.save();

    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// Get cart for a user
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
>>>>>>> 4a48595c24b3b40527fbe5d0e0b7d11d158cfbe9
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
<<<<<<< HEAD

    if (cart) {
     
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);

      await cart.save();
      res.status(200).json({ message: "Item removed from cart successfully!", cart });
    } else {
      res.status(404).json({ message: "Cart not found!" });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

module.exports = {addToCart,getCart,removeFromCart};
=======
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.calculateTotalPrice();
    await cart.save();

    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
};
>>>>>>> 4a48595c24b3b40527fbe5d0e0b7d11d158cfbe9
