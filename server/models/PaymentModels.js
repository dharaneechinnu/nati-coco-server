const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
     
    },
    currency: {
      type: String,
      default: "INR",
    },
    receipt: {
      type: String,
    },
    status: {
      type: String,
      default: "pending", // Other possible values: "paid", "failed"
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Paymentmodel = mongoose.model("Payment", paymentSchema);
module.exports = Paymentmodel;
