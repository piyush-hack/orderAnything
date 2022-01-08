const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// All Cutsomer user Profiles
const Profile = Schema({
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
  cart: { type: Array, default: [] },
});

module.exports = mongoose.model("Profile", Profile);
