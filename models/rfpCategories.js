const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const rfpCategoriesSchema = new mongoose.Schema({
  companyID:{
    type:Number,
    required:true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "active",
  },
});

// Add auto-increment functionality to categoryID
rfpCategoriesSchema.plugin(AutoIncrement, { inc_field: "categoryID" });

const rfpCategories = mongoose.model("categories", rfpCategoriesSchema);

module.exports = rfpCategories;
