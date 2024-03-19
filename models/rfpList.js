const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const vendorSchema = new mongoose.Schema({
  userID: {
    type: Number,
    required: true,
  },
  applied: {
    type: Boolean,
    default: false,
  },
});

const rfpListSchema = new mongoose.Schema({
  companyID:{
    type:Number,
    required:true,
  },
  rfpNo: {
    type: Number,
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

rfpListSchema.plugin(AutoIncrement, { inc_field: "rfpNo" });

const rfpList = mongoose.model("rfp_list", rfpListSchema);

module.exports = rfpList;
