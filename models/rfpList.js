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

const rfpListSchema = new mongoose.Schema({
  userID: {
    type: String,
    require: true,
  },
  rfpNo: {
    type: Number,
    require: true,
    unique: true,
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
  vendors: {
    type: [vendorSchema],
    required: true,
  },
});

const rfpList = mongoose.model("rfp_list", rfpListSchema);

module.exports = rfpList;
