const userLocation = require('../../models/UserModel');

const PostUserLiveLocation = async (req, res) => {
    try {
      const { userId, latitude, longitude } = req.body;
  
      if (!userId || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required: userId, latitude, and longitude.' });
      }
  
      const user = await userLocation.findByIdAndUpdate(
        userId,
        { 
          liveLocation: { latitude, longitude, timestamp: new Date() } 
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({ message: 'Live location updated successfully.', liveLocation: user.liveLocation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating live location.', error });
    }
  };


const GetLiveLocation = async(req,res) =>{
  try {
    const{userId} =req.params;
    const user = await userLocation.findById(userId);
    if(!user){
      res.status(400).json({message:"Use Live location Not Found"});
    }
    res.status(200).json({livelocations:user.liveLocation});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching live location.', error });
  }
}


const postUserAddress = async (req, res) => {
    try {
      const { userId, type, address, latitude, longitude, landmark } = req.body;
  
      if (!userId || !type || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required: userId, type, address, latitude, and longitude.' });
      }

      const user = await userLocation.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      user.addresses.push({
        type,
        address,
        latitude,
        longitude,
        landmark: landmark || null,
      
      });

      await user.save();
  
      res.status(201).json({ message: 'Address added successfully.', addresses: user.addresses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding address.', error });
    }
  };

  const getUserAddresses = async (req, res) => {
    try {
      const { userId } = req.params;
  
      if (!userId) {
        return res.status(400).json({ message: 'UserId is required.' });
      }
  
      const user = await userLocation.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({ addresses: user.addresses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching addresses.', error });
    }
  };
  
  
module.exports = {PostUserLiveLocation,postUserAddress,GetLiveLocation,getUserAddresses};