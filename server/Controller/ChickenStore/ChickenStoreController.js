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

// Add Menu Item with Image Upload
const addMenuItem = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    console.log('File uploaded:', req.file);  // Corrected this line
    
    const { storeId, itemName, description, price } = req.body;

    // Ensure that an image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    try {
      // Create the new menu item in the database
      const menuItem = await MenuModels.create({
        storeId,
        itemName,
        description,
        price,
        image: `/ImageStore/${req.file.filename}`,  // Image URL with filename
      });

      console.log('Menu item added:', menuItem);  // Corrected this line
      res.status(201).json({
        message: 'Menu item added successfully',
        menuItem,
      });
    } catch (error) {
      console.error('Error adding menu item:', error);  // Corrected this line
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
};



// Update Menu Item by CityStore with Image Upload
const updateMenuItem = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    const { id } = req.params;
    const { itemName, description, price, availability } = req.body;
    const image = req.file ? `/ImageStore/${req.file.filename}` : null;

    try {
      const updatedMenuItem = await MenuModels.findByIdAndUpdate(
        id,
        { itemName, description, price, image, availability },
        { new: true }
      );

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

// Delete Menu Item by CityStore
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

// Get Menu Items
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuModels.find();

    // Check if menu items are found
    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: 'No menu items found' });
    }

    // Respond with all menu items, including image URLs
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
  getOrders 
};
