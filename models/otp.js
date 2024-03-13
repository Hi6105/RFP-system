const mongoose = require("mongoose");

const otp_schema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
  otp: {
    type: Number,
    require: true,
  },
});

const otpSchema = mongoose.model("otp-schema", otp_schema);

module.exports = otpSchema;
