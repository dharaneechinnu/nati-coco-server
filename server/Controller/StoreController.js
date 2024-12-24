// controllers/storeController.js
const geolib = require('geolib');
const Store = require('../models/StoreModel'); // Fixed: Changed stores to Store

const addStore = async (req, res) => {
    try {
      const { name, latitude, longitude, address, phone } = req.body;
  
      // Validate required fields
      if (!name || !latitude || !longitude || !address) {
        return res.status(400).json({ error: 'All required fields must be provided: name, latitude, longitude, address' });
      }
  
      // Create a new store
      const newStore = new Store({
        name,
        latitude,
        longitude,
        address,
        phone,
      });
  
      // Save the store to the database
      await newStore.save();
  
      res.status(201).json({
        message: 'Store added successfully',
        store: newStore,
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while adding the store', details: error.message });
    }
};

// Function to find the nearest store
const findNearestStore = async (req, res) => { // Added async
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

module.exports = { findNearestStore, addStore };
