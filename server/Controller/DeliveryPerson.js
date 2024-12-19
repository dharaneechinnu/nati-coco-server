const DeliveryPerson = require("../models/DeliveryModels");
const mongoose = require('mongoose')
const Order = require("../models/Ordermodels");


// Add a new delivery person
const addDeliveryPerson = async (req, res) => {
  try {
    const { name, deliveryPersonId } = req.body;

    // Validate input
    if (!name || !deliveryPersonId) {
      return res.status(400).json({ message: 'Name and phone are required.' });
    }

    // Check for existing phone
    const existingPerson = await DeliveryPerson.findOne({ deliveryPersonId });
    if (existingPerson) {
      return res.status(400).json({ message: 'deliveryPersonId already exists.' });
    }

    // Create new delivery person
    const newPerson = await DeliveryPerson.create({ name, deliveryPersonId });
    res.status(201).json({ message: 'Delivery person added successfully.', deliveryPerson: newPerson });
  } catch (error) {
    console.error('Error adding delivery person:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update delivery person's location
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


const assignDeliveryPerson = async (req, res) => {
  const { orderId, deliveryPersonId } = req.body;

  try {
   
    // Check if delivery person is available
    const deliveryPerson = await DeliveryPerson.findOne({ deliveryPersonId: deliveryPersonId });
    if (!deliveryPerson || !deliveryPerson.availability) {
      return res.status(400).json({ message: "Delivery person not available!" });
    }

    // Assign delivery person to the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryPersonId },
      { new: true }
    );

    if (order) {
      // Update delivery person's availability
      await DeliveryPerson.findByIdAndUpdate(
        deliveryPersonId,
        { availability: false },
        { new: true }
      );

      res.status(200).json({ message: "Delivery person assigned!", order });
    } else {
      res.status(404).json({ message: "Order not found!" });
    }
  } catch (error) {
    console.error("Error assigning delivery person:", error);
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







module.exports={updateLocation,addDeliveryPerson,assignDeliveryPerson,getDeliveryPersonLocation}
