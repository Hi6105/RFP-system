const express = require("express");
const router = express.Router();
const RFP_list = require("../models/RFP_list");

router.post("/", async (req, res) => {
  const rfpRecords = await RFP_list.find({
    userID: specificValue,
    "vendors.applied": true,
  });
  console.log(rfpRecords);
});

module.exports = router;
