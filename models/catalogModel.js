const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//catalog database
const catalog = Schema({

  catalogname: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
  },
  Addresses: { type: Array, default: [] },

});

module.exports = mongoose.model("catalog", catalog);
