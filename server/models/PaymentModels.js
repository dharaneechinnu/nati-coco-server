const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  stripe_payment_intent_id: String,
  stripe_client_secret: String,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);