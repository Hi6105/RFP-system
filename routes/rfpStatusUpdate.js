const express = require("express");
const router = express.Router();
const RFP_list = require("../models/rfpList");

router.post("/", async (req, res) => {
  const { rfpNo } = req.body;
  console.log(rfpNo);
  const records = await RFP_list.findOne({ rfpNo: rfpNo });
  let status, action;
  console.log(records);
  if (records.status == "OPEN") status = "CLOSE";
  else status = "OPEN";
  if (records.action == "Close") action = "Open";
  else action = "Close";
  console.log(status, action);
  await RFP_list.findOneAndUpdate(
    { rfpNo: rfpNo },
    { status: status, action: action }
  );
  res.send({ message: "RFP status updated." });
});

module.exports = router;
