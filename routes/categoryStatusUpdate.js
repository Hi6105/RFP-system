const express = require("express");
const router = express.Router();
const RFP_categories = require("../models/RFP_categories");

router.post("/", async (req, res) => {
  const { serialNumber } = req.body;
  const records = await RFP_categories.findOne({
    serialNumber: serialNumber,
  });
  let status, action;
  if (records.status == "active") status = "inactive";
  else status = "active";
  if (records.action == "Deactivate") action = "Activate";
  else action = "Deactivate";
  await RFP_categories.findOneAndUpdate(
    { serialNumber: serialNumber },
    { status: status, action: action }
  );
  res.send({ message: "Category status updated" });
});

module.exports = router;
