const Order = require("../../models/Ordermodels");
const Store = require('../../models/CityOwnerModel');
const DeliveryPerson = require('../../models/DeliveryModels');
const MenuModels = require('../../models/MenuModel');
const geolib = require('geolib'); // Added missing geolib import
const mongoose = require("mongoose");
const crypto = require('crypto');

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
    const { userId, storeId, items, amount, paymentStatus, deliveryPersonId, location } = req.body;

    console.log("Incoming Order Data:", req.body);

    // Validate required fields
    if (!userId || !amount || !paymentStatus) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate `userId` as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
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
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


const getOrderAnalytics = async (req, res) => {
    try {
        const { timeFilter = 'WEEK' } = req.query;
        const now = new Date();
        const filterDate = new Date();

        switch (timeFilter) {
            case 'WEEK':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'MONTH':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'YEAR':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                filterDate.setDate(now.getDate() - 7);
        }

        // Get filtered orders
        const orders = await Order.find({
            createdAt: { $gte: filterDate }
        }).populate('storeId', 'name');

        // Calculate total stats
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate daily data
        const dailyData = {};
        orders.forEach(order => {
            const date = order.createdAt.toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = {
                    revenue: 0,
                    orders: 0,
                    avgOrderValue: 0
                };
            }
            dailyData[date].revenue += order.total;
            dailyData[date].orders += 1;
        });

        // Calculate store performance
        const storeStats = {};
        orders.forEach(order => {
            if (!storeStats[order.storeId._id]) {
                storeStats[order.storeId._id] = {
                    id: order.storeId._id,
                    name: order.storeId.name,
                    orders: 0,
                    revenue: 0,
                    ratings: []
                };
            }
            storeStats[order.storeId._id].orders += 1;
            storeStats[order.storeId._id].revenue += order.total;
            if (order.rating) {
                storeStats[order.storeId._id].ratings.push(order.rating);
            }
        });

        // Process store stats
        const topStores = Object.values(storeStats)
            .map(store => ({
                ...store,
                rating: store.ratings.length > 0 
                    ? store.ratings.reduce((a, b) => a + b) / store.ratings.length 
                    : 0
            }))
            .sort((a, b) => b.orders - a.orders);

        // Calculate percentage changes (mock data for now)
        const percentageChanges = {
            orders: 12.5,
            revenue: 8.3,
            avgOrderValue: -2.1
        };

        res.status(200).json({
            totalStats: {
                orders: 200,
                revenue: totalRevenue,
                avgOrderValue,
                percentageChanges
            },
            dailyData: Object.values(dailyData),
            topStores: topStores.slice(0, 5)
        });
    } catch (error) {
        console.error('Error in getOrderAnalytics:', error);
        res.status(500).json({ message: "Error fetching order analytics", error: error.message });
    }
};

const findNearestStoreAndDisplayMenu = async (req, res) => {
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
    const allStores = await Store.find();
    if (!allStores || !allStores.length) {
      return res.status(404).json({ message: 'No stores found' });
    }

    const validStores = allStores.filter(store => 
      store.locations?.latitude !== undefined && 
      store.locations?.longitude !== undefined
    );

    if (!validStores.length) {
      return res.status(404).json({ message: 'No valid stores found' });
    }

    const storesWithinRange = validStores.filter(store => {
      const storeLocation = { 
        latitude: store.locations.latitude, 
        longitude: store.locations.longitude 
      };
      const distanceToUser = geolib.getDistance(userLocation, storeLocation);
        //Change based on needs from client
      return distanceToUser <= 10000; 
    });

    if (!storesWithinRange.length) {
      return res.status(404).json({ message: 'No nearby stores within 10 km found' });
    }

    
    const nearestStore = storesWithinRange.reduce((closest, store) => {
      const storeLocation = { 
        latitude: store.locations.latitude, 
        longitude: store.locations.longitude 
      };
      const distanceToUser = geolib.getDistance(userLocation, storeLocation);

      if (!closest || distanceToUser < closest.distance) {
        return { id: store._id, distance: distanceToUser };
      }
      return closest;
    }, null);

    if (!nearestStore) {
      return res.status(404).json({ message: 'Unable to find a nearest store' });
    }

    console.log(nearestStore.id);

    const storeMenu = await MenuModels.find({
      storeId: nearestStore.id,
      availability: true
    });

    if (!storeMenu.length) {
      return res.status(404).json({ message: 'No menu items available at the nearest store' });
    }

    res.json({
      message: `Nearest store menu retrieved successfully`,
      nearestStoreId: nearestStore.id,
      menu: storeMenu.map(item => ({
        ...item._doc,
        image: `http://${req.headers.host}/ImageStore/${item.image}`, // Ensure correct path
      })),
    });
    
    
  } catch (error) {
    console.error("Error finding nearest store and its menu:", error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request', 
      details: error.message 
    });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

const markOrderReadyAndAssignDelivery = async (req, res) => {
  try {
    const { orderId, storeId } = req.body;

    // Validate inputs
    if (!orderId || !storeId) {
      return res.status(400).json({ error: 'Order ID and Store ID are required' });
    }

    // Fetch store details
    const store = await Store.findById(storeId);
    if (!store || !store.locations || !store.locations.latitude || !store.locations.longitude) {
      return res.status(404).json({ message: 'Store not found or has invalid location' });
    }

    const storeLocation = {
      latitude: store.locations.latitude,
      longitude: store.locations.longitude,
    };

    // Fetch all available delivery persons
    const availableDeliveryPersons = await DeliveryPerson.find({ availability: true });
    if (!availableDeliveryPersons.length) {
      return res.status(404).json({ message: 'No available delivery persons found' });
    }

    // Calculate distances to store and filter within range (20 km)
    const maxDistance = 20000; // 20 km in meters
    const deliveryPersonsInRange = availableDeliveryPersons
      .map(person => {
        if (!person.location || !person.location.latitude || !person.location.longitude) {
          return null;  // Skip persons without a location
        }

        const deliveryPersonLocation = {
          latitude: person.location.latitude,
          longitude: person.location.longitude,
        };

        const distanceToStore = geolib.getDistance(storeLocation, deliveryPersonLocation);
        return distanceToStore <= maxDistance
          ? { person, distance: distanceToStore }
          : null;
      })
      .filter(Boolean);  // Filter out null values

    if (!deliveryPersonsInRange.length) {
      return res.status(404).json({ message: 'No delivery persons available within range' });
    }

    // Find the nearest delivery person
    const nearestDeliveryPerson = deliveryPersonsInRange.reduce((closest, current) =>
      !closest || current.distance < closest.distance ? current : closest, null
    );

    if (!nearestDeliveryPerson) {
      return res.status(404).json({ message: 'Unable to assign a delivery person' });
    }

    console.log('Nearest delivery person:', nearestDeliveryPerson.person.name);

    // Mark the order as ready and assign the delivery person
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate and save the OTP for the order
    const otp = generateOTP();
    order.deliveryOTP = otp;  // Save the generated OTP in the order document
    order.status = 'READY';
    order.deliveryPersonId = nearestDeliveryPerson.person._id; // Assigning ObjectId correctly
    await order.save();
    console.log('Order updated:', order);

    // Update the delivery person's availability to false (no longer available)
    nearestDeliveryPerson.person.availability = false;
    await nearestDeliveryPerson.person.save();
    console.log('Updated delivery person availability:', nearestDeliveryPerson.person.name);

    // Respond with success and delivery details, including OTP
    res.status(200).json({
      message: 'Order marked as ready and delivery person assigned',
      orderId: order._id,
      deliveryPerson: {
        id: nearestDeliveryPerson.person._id,
        name: nearestDeliveryPerson.person.name,
        distance: `${(nearestDeliveryPerson.distance / 1000).toFixed(2)} km`,  // Distance in km
      },
      OTP: order.deliveryOTP,  // Include OTP in the response
    });
  } catch (error) {
    console.error('Error marking order ready and assigning delivery:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message,
    });
  }
};










const verifyAndComplete = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify OTP
    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired (optional: OTP valid for 1 hour)
    const otpAge = (new Date() - new Date(order.otpGeneratedAt)) / 1000 / 60 / 60; // hours
    if (otpAge > 1) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Update order status
    order.status = 'COMPLETED';
    order.completedAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Order completed successfully' });
  } catch (error) {
    console.error('Error verifying and completing order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
    createOrder,
    findNearestStoreAndDisplayMenu,
    getOrderAnalytics,
    markOrderReadyAndAssignDelivery,
    verifyAndComplete
};
