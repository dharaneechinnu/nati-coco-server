const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicates
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
<<<<<<< HEAD
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});
=======
  { timestamps: true }
);

>>>>>>> f75e115691b3fb7352480061f821c720cee01fa2

module.exports = mongoose.model('Payment', paymentSchema);