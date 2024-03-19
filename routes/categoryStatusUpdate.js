const express = require("express");
const router = express.Router();
const RFP_categories = require("../models/rfpCategories");

router.post("/", async (req, res) => {
  const { categoryID } = req.body;
  const records = await RFP_categories.findOne({
    categoryID: categoryID,
  });
  let status;
  if (records.status == "active") status = "inactive";
  else status = "active";
  await RFP_categories.findOneAndUpdate(
    { categoryID: categoryID },
    { status: status }
  );
  res.send({ message: "Category status updated" });
});

module.exports = router;
