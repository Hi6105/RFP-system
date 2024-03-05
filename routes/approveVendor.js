const express = require("express");
const router = express.Router();
const RFP_vendor_details = require("../models/RFP_vendor_details");

router.post("/", async (req, res) => {
  const { serialNumber } = req.body;
  await RFP_vendor_details.findOneAndUpdate(
    { serialNumber: serialNumber },
    { status: "Approved" },
    { new: true, upsert: true }
  );
  res.send("Vendor approved");
});

module.exports = router;
