const CityStore = require('../../models/CityOwnerModel');
const MenuModels = require('../../models/MenuModel');
const DeliveryPerson = require("../../models/DeliveryModels");
const Order = require('../../models/Ordermodels');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// CityStore Login
const CityStoreLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Enter All fields" });
    }
    const user = await CityStore.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Email Not Found" });
    }
    const Isvalidate = await bcrypt.compare(password, user.password);
    if (Isvalidate) {
      const accessToken = jwt.sign(
        { email: email, userId: user._id },
        process.env.CITYOWNER_TOKEN,
        { expiresIn: '1d' }
      );
      res.status(200).json({
        message: "CityStore Login Successfull",
        accessToken,
        user: {
          userId: user._id,
          name: user.name,
          mobileno: user.mobileno,
          email: user.email,
        }
      });
    } else {
      res.status(401).json({ message: "Wrong Password!.." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'ImageStore/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

const addMenuItem = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    const { storeId, category, subCategory, itemName, description, price, availability } = req.body;

    // Ensure an image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    try {
      const menuItem = await MenuModels.create({
        storeId,
        category,
        subCategory,
        itemName,
        description,
        price,
        availability,
        image: `/ImageStore/${req.file.filename}`, // Save image path
      });

      res.status(201).json({
        message: 'Menu item added successfully',
        menuItem,
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
};

// Update Menu Item by ID with Image Upload
const updateMenuItem = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    const { id } = req.params;
    const { category, subCategory, itemName, description, price, availability } = req.body;
    const image = req.file ? `/ImageStore/${req.file.filename}` : null;

    try {
      const updateData = {
        category,
        subCategory,
        itemName,
        description,
        price,
        availability,
      };

      if (image) updateData.image = image;

      const updatedMenuItem = await MenuModels.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      res.status(200).json({
        message: 'Menu item updated successfully',
        updatedMenuItem,
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
};

// Delete Menu Item by ID
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMenuItem = await MenuModels.findByIdAndDelete(id);

    if (!deletedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get Menu Items by Category, Subcategory, and Store ID
const getMenuItemsByCategory = async (req, res) => {
  const { subCategory, storeId } = req.query;

  try {
    const query = {};
    if (subCategory) query.subCategory = subCategory;
    if (storeId) query.storeId = storeId;

    const menuItems = await MenuModels.find(query);

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: 'No menu items found for the specified filters' });
    }

    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Get All Menu Items by Store ID
const getMenuItems = async (req, res) => {
  const { storeId } = req.query;

  try {
    const query = {};
    if (storeId) query.storeId = storeId;

    const menuItems = await MenuModels.find(query);

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: 'No menu items found for the specified store' });
    }

    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Add Delivery Person
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

// Get Delivery Persons
const getDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find();

    if (!deliveryPersons.length) {
      return res.status(404).json({ 
        message: 'No delivery persons found' 
      });
    }

    res.status(200).json({
      message: 'Delivery persons retrieved successfully',
      deliveryPersons
    });
  } catch (error) {
    console.error('Error retrieving delivery persons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Orders
const getOrders = async (req, res) => {
  try {
    const { storeId } = req.body;
    const orders = await Order.find({ storeId: storeId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { 
  CityStoreLogin, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getMenuItems, 
  addDeliveryPerson, 
  getDeliveryPersons, 
  getOrders,
  getMenuItemsByCategory 
};
