const mongoose = require("mongoose");

const DeliveryPersonSchema = new mongoose.Schema(
  {
    deliverypersonId: {
      type: String,
    
    },
    name: {
      type: String,
     
    },
    email:{
      type:String,
     
    },
    phonenumber:{
      type:String,
     
    },
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
    availability: { 
      type: Boolean,
    
      default: true
     },
    isVerified:{
      type:Boolean,
      default:false
    },
    otpToken: {
      type: String,
      default:null,
    },
    otpExpire: {
      type: Date,
    },
    documents: [String],  // Array to store file paths
  },
  { timestamps: true }
);

const DeliveryPersonModel = mongoose.model("DeliveryPerson", DeliveryPersonSchema);
module.exports = DeliveryPersonModel;