const Order = require("../models/Ordermodels");
const DeliveryPerson = require("../models/DeliveryModels");

// Get all pending orders
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};



const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      orderId,
      paymentStatus,
      deliveryPersonId,
      location,
    } = req.body;

    // Validate required fields
    if (!userId || !amount || !orderId || !paymentStatus) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Create a new order
    const newOrder = await Order.create({
      userId,
      items,
      amount,
      orderId,
      paymentStatus,
      deliveryPersonId: deliveryPersonId || null,
      location: location || { latitude: null, longitude: null },
    });

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports ={getPendingOrders, createOrder, getOrders }