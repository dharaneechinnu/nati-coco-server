const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the item
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
    required: true,
  },
  deliveryPersonId: {
    type: Number,
    
  },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "Delivered"],
    required: true,
    default: "Pending",
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
}, { timestamps: true });

const ordermodel = mongoose.model("Order", OrderSchema);
module.exports = ordermodel;
