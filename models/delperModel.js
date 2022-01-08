const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Deleviry Person Profile database
const delPerProfile = Schema({
  username: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: { type: Array, default: [] },
  dob: {
    type: Date,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  orders: { type: Array, default: [] },
});

module.exports = mongoose.model("delPerProfile", delPerProfile);
