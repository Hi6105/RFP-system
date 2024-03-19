const mongoose = require("mongoose");
require("mongoose-long")(mongoose);

/**
 * Image schema
 */
const imageSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    default: false,
  },
});

/**
 * Funtions to return either true or false
 * based on the mathces with their corresponding regular expressions.
 */
const validatePAN = function (PAN) {
  const regpan = /^([a-zA-Z])([0-9])([a-zA-Z])?$/;
  return regpan.test(PAN);
};
const validateGST = function (GSTno) {
  const regGST = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regGST.test(GSTno);
};

/**
 * Schema for storing extra vendor details apart from details in RFPuserDetails schema.
 */
const rfpVendorDetailSchema = new mongoose.Schema({
  userID: {
    type: Number,
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
    unique: true,
    validate: [validateGST, "Please fill a valid GST Number"],
  },
  PAN: {
    type: String,
    require: true,
    unique: true,
    //validate: [validatePAN, "Please fill a valid PAN Number"],
  },
  phoneNumber: {
    type: String,
    require: true,
    unique: true,
    minLength: [10, "no should have minimum 10 digits"],
    maxLength: [10, "no should have maximum 10 digits"],
    match: [/\d{10}/, "no should only have digits"],
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Rejected",
  },
  image: {
    type: imageSchema,
  },
});

const rfpVendorDetail = mongoose.model(
  "RFP_vendor_details",
  rfpVendorDetailSchema
);

module.exports = rfpVendorDetail;
