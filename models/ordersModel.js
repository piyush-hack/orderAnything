const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// All requested orders Database
const orders = Schema({
  customerID: {
    type: String,
  },
  deliveryPersonNo: {
    type: String,
  },
  Items: { type: Array, default: [] },
  pickupLocations : { type: Array, default: [] },
  date: {
    type: Date,
    default: Date.now,
  },
  orderStage: {
    type: String,
    required: true,
    "default" : "Task Created",
    enum: [
      "Task Created",
      "Reached Store",
      "Items Picked",
      "Enroute",
      "Delivered ",
      "Canceled",
    ],

  },
});

module.exports = mongoose.model("orders", orders);
