const Order = require("../../models/Ordermodels");

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
      storeId,
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
      storeId,
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



const findNearestStoreAndDisplay = async (req, res) => { // Added async
  try {
    const { latitude, longitude } = req.query;
    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLocation = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

    // Get all stores from database
    const allStores = await Store.find(); // Added: Get stores from database

    if (!allStores.length) {
      return res.status(404).json({ message: 'No stores found' });
    }

    // Find the nearest store
    const nearestStore = allStores.reduce((closest, store) => {
      const storeLocation = {
        latitude: store.latitude,
        longitude: store.longitude
      };
      const distanceToUser = geolib.getDistance(userLocation, storeLocation);
      return !closest || distanceToUser < closest.distance
        ? { ...store.toObject(), distance: distanceToUser }
        : closest;
    }, null);

    res.json({
      message: `The nearest store is ${nearestStore.name}`,
      store: nearestStore,
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while finding nearest store', details: error.message });
  }
};


module.exports ={createOrder,findNearestStoreAndDisplay}