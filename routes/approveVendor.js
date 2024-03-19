const express = require("express");
const router = express.Router();
const RFP_vendor_details = require("../models/rfpVendorDetail");

router.post("/", async (req, res) => {
  const { userID } = req.body;
  await RFP_vendor_details.findOneAndUpdate(
    { userID: userID },
    { status: "Approved" },
    { new: true, upsert: true }
  );
  res.send({ message: "Vendor approved" });
});

module.exports = router;
