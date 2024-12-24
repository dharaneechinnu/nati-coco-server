const DeliveryPerson = require("../models/DeliveryModels");
const mongoose = require('mongoose')
const Order = require("../models/Ordermodels");
const geolib = require("geolib");


const addDeliveryPerson = async (req, res) => {
  try {
    const { name, deliveryPersonId } = req.body;

    if (!name || !deliveryPersonId) {
      return res.status(400).json({ message: "Name and deliveryPersonId are required." });
    }

    const existingPerson = await DeliveryPerson.findOne({ deliveryPersonId });
    if (existingPerson) {
      return res.status(400).json({ message: "Delivery person with this ID already exists." });
    }

    const newPerson = await DeliveryPerson.create({ name, deliveryPersonId });
    res.status(201).json({
      message: "Delivery person added successfully.",
      deliveryPerson: newPerson,
    });
  } catch (error) {
    console.error("Error adding delivery person:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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


module.exports={updateLocation,addDeliveryPerson,getDeliveryPersonLocation,findNearestDeliveryPerson}
