const CityOwnerModels = require('../models/CityOwnerModel');

// Get all City Owners without the password field
const getCityOwners = async (req, res) => {
  try {
    // Fetch all city owners and exclude the 'password' field
    const cityOwners = await CityOwnerModels.find().select('-password');

    if (!cityOwners.length) {
      return res.status(404).json({ message: 'No city owners found' });
    }

    res.status(200).json({
      message: 'City owners retrieved successfully',
      cityOwners,
    });
  } catch (error) {
    console.error('Error retrieving city owners:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCityOwners,
};
