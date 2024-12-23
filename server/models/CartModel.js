const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
},
  items: [
    {
      productId: { 
        type: String, 
        required: true 
    },
      name: { 
        type: String, 
        required: true 
    },
      quantity: { 
        type: Number, 
        default: 1 
    },
      price: { 
        type: Number, 
        required: true 
    },
    },
  ],
  totalPrice: { 
    type: Number, 
    default: 0 
},
});

cartSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  return this.totalPrice;
};

module.exports = mongoose.model('Cart', cartSchema);
