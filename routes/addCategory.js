const express = require("express");
const router = express.Router();
const rfpCategories = require("../models/rfpCategories");

/**
 *  Adding a new category
 */
router.post("/", async (req, res) => {
  const { category } = req.body;
  const newCategory = new rfpCategories({
    companyID:req.session.companyID,
    categoryName: category,
  });
  await newCategory.save();
  res.send({ message: "Category Added" });
});

module.exports = router;
