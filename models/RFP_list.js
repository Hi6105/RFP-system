const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  applied: {
    type: Boolean,
    default: false,
  },
});

const RFP_list_schema = new mongoose.Schema({
  userID: {
    type: String,
    require: true,
  },
  rfpNo: {
    type: Number,
    require: true,
  },
  itemName: {
    type: String,
    require: true,
  },
  itemDescription: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  lastDate: {
    type: Date,
    require: true,
  },
  maxPrice: {
    type: Number,
    require: true,
  },
  minPrice: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    default: "OPEN",
  },
  action: {
    type: String,
    default: "Close",
  },
  vendors: {
    type: [vendorSchema],
    required: true,
  },
});

const RFP_list = mongoose.model("rfp_list", RFP_list_schema);

module.exports = RFP_list;
