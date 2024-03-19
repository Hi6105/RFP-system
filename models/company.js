const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
});

// Add auto-increment functionality to categoryID
companySchema.plugin(AutoIncrement, { inc_field: "companyID" });

const company = mongoose.model("company", companySchema);

module.exports = company;
