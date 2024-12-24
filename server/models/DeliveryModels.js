const mongoose = require("mongoose");

const DeliveryPersonSchema = new mongoose.Schema(
  {
    deliveryPersonId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
    availability: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const DeliveryPersonModel = mongoose.model("DeliveryPerson", DeliveryPersonSchema);
module.exports = DeliveryPersonModel;