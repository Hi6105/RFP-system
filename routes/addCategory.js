const express = require("express");
const router = express.Router();
const RFP_categories = require("../models/RFP_categories");

router.post("/", async (req, res) => {
  const { category } = req.body;
  const records = await RFP_categories.find({});
  console.log(records.length);
  const serialNum = records.length + 1;
  const newCategory = new RFP_categories({
    serialNumber: serialNum,
    category: category,
  });
  await newCategory.save();
  res.send({ message: "Category Added" });
});

module.exports = router;
