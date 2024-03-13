const mongoose = require("mongoose");

const rfpQuotesSchema = new mongoose.Schema({
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

const rfpQuotes = mongoose.model("rfp_quotes", rfpQuotesSchema);

module.exports = rfpQuotes;
