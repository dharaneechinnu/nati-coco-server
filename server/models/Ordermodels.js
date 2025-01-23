const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UsersLogins",
    required: true,
  },
  
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "citystore",
    required: true,
  },

  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPerson',  // Reference to the DeliveryPerson model
    required: false,
  },
  status: {
    type: String,
    enum: ["PENDING", "PREPARING", "READY", "COMPLETED", "REJECTED"],
    required: true,
    default: "PENDING",
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  // New fields for OTP verification
  deliveryOTP: {
    type: String,
    default: null
  },
  otpGeneratedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  preparingStartedAt: {
    type: Date,
    default: null
  },
  readyAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const ordermodel = mongoose.model("Order", OrderSchema);
module.exports = ordermodel;