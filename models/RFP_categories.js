const mongoose = require("mongoose");

const RFP_categories_schema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    unique: true,
  },
  category: {
    type: String,
    require: true,
    unique: true,
  },
  status: {
    type: String,
    default: "active",
  },
  action: {
    type: String,
    default: "Deactivate",
  },
});

const RFP_categories = mongoose.model("categories", RFP_categories_schema);

module.exports = RFP_categories;
