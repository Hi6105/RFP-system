const mongoose = require("mongoose");

const uri = "mongodb://localhost:27017/RFP";

const db = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = db;
