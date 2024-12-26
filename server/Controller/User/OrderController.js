const Order = require("../../models/Ordermodels");
const Store = require('../../models/Ordermodels');
const MenuModels = require('../../models/MenuModel');
const geolib = require('geolib'); // Added missing geolib import

const generateUniqueOrderId = async () => {
  const maxAttempts = 10;
  let orderId;
  let isUnique = false;
  let attempts = 0;

  do {
    const randomNum = Math.floor(Math.random() * 90000) + 10000; 
    orderId = `ORD#${randomNum}`;

    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }

    attempts++;
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    throw new Error("Unable to generate a unique orderId after multiple attempts.");
  }

  return orderId;
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      paymentStatus,
      deliveryPersonId,
      location,
    } = req.body;

    if (!userId || !amount || !paymentStatus) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const orderId = await generateUniqueOrderId();

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

const findNearestStoreAndDisplay = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const userLocation = { latitude: lat, longitude: lon };

    // Fetch all stores from the database
    const allStores = await Store.find();
    console.log(allStores)
    if (!allStores.length) {
      return res.status(404).json({ message: 'No stores found' });
    }

    // Filter valid stores with proper latitude and longitude
    const validStores = allStores.filter(store => 
      store.latitude !== undefined && 
      store.longitude !== undefined
    );

    if (!validStores.length) {
      return res.status(404).json({ message: 'No valid stores found' });
    }

    // Find the nearest store
    const nearestStore = validStores.reduce((closest, store) => {
      const storeLocation = { latitude: store.latitude, longitude: store.longitude };
      const distanceToUser = geolib.getDistance(userLocation, storeLocation);

      if (!closest || distanceToUser < closest.distance) {
        return { ...store.toObject(), distance: distanceToUser };
      }
      return closest;
    }, null);

    // Fetch the store menu
    const storeMenu = await MenuModels.find({ 
      storeId: nearestStore._id, 
      availability: true 
    });

    res.json({
      message: `The nearest store is ${nearestStore.name}`,
      store: {
        name: nearestStore.name,
        address: nearestStore.address,
        phone: nearestStore.phone,
        distance: `${(nearestStore.distance / 1000).toFixed(2)} km`,
        coordinates: {
          latitude: nearestStore.latitude,
          longitude: nearestStore.longitude
        }
      },
      menu: storeMenu
    });
  } catch (error) {
    console.error("Error finding nearest store:", error);
    res.status(500).json({ 
      error: 'An error occurred while finding the nearest store and its menu', 
      details: error.message 
    });
  }
};


module.exports = {createOrder, getOrders, findNearestStoreAndDisplay}