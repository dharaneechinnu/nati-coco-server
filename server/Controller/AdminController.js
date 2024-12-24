const Admin = require('../models/AdminModel');
const CityAdmin = require('../models/CityOwnerModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const adminToken = jwt.sign(
      { role: admin.role },
      process.env.ADMIN_TOKEN,
      { expiresIn: '1h' }
    );

    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData._id; 

    res.status(200).json({
      message: 'Login successful',
      adminToken,
      admin: adminData
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Internal server error', status: error });
  }
};



// AddCityStoreAdmin Controller
const AddCityStoreAdmin = async (req, res) => {
  const citydetails = { name, email, password,mobileno,locations,cityName } = req.body;
console.log(citydetails);
  try {
    const existingAdmin = await CityAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Citystore Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const CityownerAdmin = await CityAdmin.create({
      name,
      email,
      password: hashedPassword,
      role: 'cityOwner',
      cityName:cityName,
      mobileno:mobileno,
      locations
      
    });

    console.log(CityownerAdmin)
   
    res.status(201).json({ message: 'CityStore Admin registered successfully' });
  } catch (error) {
    console.error('Error during CityStore admin registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  loginAdmin,
  AddCityStoreAdmin,
};