const express = require("express");
const router = express.Router();
const otpSchema = require("../models/otp");

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  const record = await otpSchema.findOne({ email: email });
  if (record) {
    if (record.otp == otp) {
      res.send({ message: "Otp Matched." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
