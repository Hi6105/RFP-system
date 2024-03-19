const mongoose = require("mongoose");

const rfpQuotesSchema = new mongoose.Schema({
  companyID:{
    type:Number,
    required:true,
  },
  rfpNo: {
    type: Number,
    require: true,
  },
  userID: {
    type: Number,
    require: true,
    unique: false,
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
