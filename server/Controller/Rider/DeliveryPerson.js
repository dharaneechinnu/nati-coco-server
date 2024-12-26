const DeliveryPerson = require("../../models/DeliveryModels");
const mongoose = require('mongoose')
const Order = require("../../models/Ordermodels");
const geolib = require("geolib");

// Find and assign the nearest delivery person
const findNearestDeliveryPerson = async (req, res) => {
  const { latitude, longitude, orderId } = req.body;

  try {
    if (!latitude || !longitude || !orderId) {
      return res.status(400).json({ message: "Latitude, longitude and orderId are required!" });
    }

    // Fetch all available delivery persons
    const deliveryPersons = await DeliveryPerson.find({
      availability: true,
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true },
    });

    if (deliveryPersons.length === 0) {
      return res.status(404).json({ message: "No available delivery persons found!" });
    }

    let nearestPerson = null;
    let shortestDistance = Infinity;

    // Find the delivery person with shortest distance
    for (const person of deliveryPersons) {
      const distance = geolib.getDistance(
        { latitude, longitude },
        {
          latitude: person.location.latitude,
          longitude: person.location.longitude,
        }
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPerson = person;
      }
    }

    if (!nearestPerson) {
      return res.status(404).json({ message: "Could not find a nearby delivery person" });
    }

    // Assign the nearest delivery person to the order
    const orderIdString = String(orderId);
    const order = await Order.findOneAndUpdate(
      { orderId: orderIdString },
      { deliveryPersonId: nearestPerson.deliveryPersonId },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Update delivery person availability
    await DeliveryPerson.findOneAndUpdate(
      { deliveryPersonId: nearestPerson.deliveryPersonId },
      { availability: false },
      { new: true }
    );

    res.status(200).json({
      message: "Nearest delivery person found and assigned",
      deliveryPerson: {
        id: nearestPerson.deliveryPersonId,
        name: nearestPerson.name,
        location: nearestPerson.location,
      },
      distance: `${(shortestDistance / 1000).toFixed(2)} km`,
      order
    });

  } catch (error) {
    console.error("Error finding and assigning nearest delivery person:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const updateLocation = async (req, res) => {
  const { deliveryPersonId, latitude, longitude } = req.body;

  try {
    const deliveryPerson = await DeliveryPerson.findOneAndUpdate(
      {deliveryPersonId},
      { location: { latitude, longitude } },
      { new: true }
    );

    if (deliveryPerson) {
      res.status(200).json({ message: "Location updated successfully!", deliveryPerson });
    } else {
      res.status(404).json({ message: "Delivery person not found!" });
    }
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};


const getDeliveryPersonLocation = async (req, res) => {
  const { orderId } = req.params;

  try {
    
    const order = await Order.findOne({ orderId }).populate("deliveryPersonId");

    if (order && order.deliveryPersonId) {
     
      const deliveryPerson = await DeliveryPerson.findOne({ deliveryPersonId: order.deliveryPersonId });
      if (deliveryPerson && deliveryPerson.location) {
        const locations= deliveryPerson.location;
        res.status(200).json(locations);
      } else {
        res.status(404).json({ message: "Location not available for the assigned delivery person!" });
      }
    } else {
      res.status(404).json({ message: "Order or delivery person not found!" });
    }
  } catch (error) {
    console.error("Error fetching delivery person location:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

// Update Delivery Status
const updateDeliveryStatus = async (req, res) => {
  const { deliveryPersonId, orderId, status } = req.body;

  try {
    // Validate input
    if (!deliveryPersonId || !orderId || !status) {
      return res.status(400).json({ message: "All fields are required: deliveryPersonId, orderId, and status." });
    }

    // Validate status
    const validStatuses = ["Pending", "Assigned", "Picked Up", "On the Way", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if the delivery person is assigned to the order
    if (String(order.deliveryPersonId) !== String(deliveryPersonId)) {
      return res.status(403).json({ message: "You are not assigned to this order." });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

// Fetch order history for delivered orders
const getOrderHistory = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed in the request parameters

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required!" });
    }

    // Find orders with status "Delivered" for the specified user
    const deliveredOrders = await Order.find({ 
      userId, 
      status: "Delivered" 
    }).select("orderId items amount deliveryPersonId status createdAt updatedAt");

    if (deliveredOrders.length === 0) {
      return res.status(404).json({ message: "No delivered orders found!" });
    }

    // Map the orders to return in the required format
    const orderHistory = deliveredOrders.map(order => ({
      orderId: order.orderId,
      items: order.items,
      amount: order.amount,
      deliveryPersonId: order.deliveryPersonId,
      status: order.status,
      orderDate: order.createdAt,
      deliveredDate: order.updatedAt,
    }));

    res.status(200).json({
      message: "Order history fetched successfully.",
      orderHistory,
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports={updateLocation,getDeliveryPersonLocation,findNearestDeliveryPerson, updateDeliveryStatus, getOrderHistory}
