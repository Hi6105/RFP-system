const mongoose = require("mongoose");

const RFP_quotes_schema = new mongoose.Schema({
  rfpNo: {
    type: Number,
    require: true,
  },
  vendorID: {
    type: String,
    require: true,
  },
  vendorPrice: {
    type: Number,
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
  totalCost: {
    type: Number,
    require: true,
  },
});

const RFP_quotes = mongoose.model("rfp_quotes", RFP_quotes_schema);

module.exports = RFP_quotes;
