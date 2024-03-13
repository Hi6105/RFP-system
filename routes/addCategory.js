const express = require("express");
const router = express.Router();
const RFP_categories = require("../models/rfpCategories");

/**
 *
 */
router.post("/", async (req, res) => {
  const { category } = req.body;
  const newCategory = new RFP_categories({
    categoryName: category,
  });
  await newCategory.save();
  res.send({ message: "Category Added" });
});

module.exports = router;
