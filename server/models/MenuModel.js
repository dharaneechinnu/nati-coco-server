const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'citystore', 
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  availability: {
    type: Boolean,
    default: true,
  }
});

const MenuModels = mongoose.model('Menu', MenuSchema);

module.exports =MenuModels
