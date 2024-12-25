const CityStore = require('../../models/CityOwnerModel');
const MenuModels = require('../../models/MenuModel');
const DeliveryPerson = require("../../models/DeliveryModels");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const CityStoreLogin = async(req,res)=>{
    try {
        const {email,password}= req.body;
        if(!email|| !password){
            res.status(400).json({message:"Enter All fields"});
        }
        const user = await CityStore.findOne({email});
        if(!user){
            res.status(400).json({message:"Email Not Found"});
        }
        const Isvalidate = await bcrypt.compare(password,user.password);
        if(Isvalidate){
            
             const accessToken = jwt.sign(
                           { email: email, userId: user._id },
                           process.env.CITYOWNER_TOKEN,
                           { expiresIn: '1d' }
                       );
            res.status(200).json({
              message:"CityStore Login Successfull",
                accessToken,
                user:{
                    userId:user._id,
                    name: user.name,
                    mobileno: user.mobileno,
                    email: user.email,
                }
            })
        }
        else{
            res.status(401).json({message:"Wrong Password!.."})
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


//Add Menu Item By CityStore
const addMenuItem = async (req, res) => {
  const { storeId, itemName, description, price, image } = req.body;

  try {
      const menuItem = await MenuModels.create({
          storeId,
          itemName,
          description,
          price,
          image,
      });

      res.status(201).json({
          message: 'Menu item added successfully',
          menuItem,
      });
  } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};



//Update Menu Item By CityStore
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { itemName, description, price, image, availability } = req.body;

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
};


//Delete Menu Item By CityStore
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

//add delivery person
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

module.exports = {CityStoreLogin,addMenuItem,updateMenuItem,deleteMenuItem,addDeliveryPerson};

