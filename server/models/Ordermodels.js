const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
   },
  userId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User", required: true
     },
  items: [{
     type: String,
      required: true 
    }],
  amount: {
     type: Number,
      required: true
     },
  paymentStatus: { 
    type: String,
     enum: ["Pending", "Completed"],
      required: true 
    },
  deliveryPersonId: {
     type:Number,
      },
  status: {
     type: String,
      enum: ["Pending", "Assigned", "Delivered"],
       required: true,
        default: "Pending" 
      },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
