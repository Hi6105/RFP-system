const mongoose = require("mongoose");

const RFP_user_details_schema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
});

const RFP_user_details = mongoose.model(
  "rfp_user_details",
  RFP_user_details_schema
);

module.exports = RFP_user_details;
