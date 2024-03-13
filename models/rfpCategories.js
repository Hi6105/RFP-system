const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const rfpCategoriesSchema = new mongoose.Schema({
  categoryID: {
    type: Number,
    unique: true,
  },
  categoryName: {
    type: String,
    require: true,
    unique: true,
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
