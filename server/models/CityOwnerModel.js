const mongoose = require('mongoose');


const CityOwnerschema = new mongoose.Schema({
    name: {
     type:String,
     required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    mobileno:{
        type:Number,
        required:true,
    },
    role:{
        type:String,
        enum:['cityOwner'],
        default:'cityOwner',
    },
    cityName:{
        type:String,
        required:true,
    },
    locations: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
})



const CityOwnerModels= mongoose.model('CityOwner', CityOwnerschema);

module.exports = CityOwnerModels;
