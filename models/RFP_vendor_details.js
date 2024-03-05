const mongoose = require("mongoose");
require("mongoose-long")(mongoose);

const RFP_vendor_details_schema = new mongoose.Schema({
  serialNumber: {
    type: Number,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  revenue: {
    type: Number,
    require: true,
  },
  numberOfEmployees: {
    type: Number,
    require: true,
  },
  GSTno: {
    type: String,
    require: true,
  },
  PAN: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Rejected",
  },
  action: {
    type: String,
    default: "Approve",
  },
  user_type: {
    type: String,
    default: "vendor",
  },
});

const RFP_vendor_details = mongoose.model(
  "RFP_vendor_details",
  RFP_vendor_details_schema
);

module.exports = RFP_vendor_details;
