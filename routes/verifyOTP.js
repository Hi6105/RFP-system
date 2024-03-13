const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const otpSchema = require("../models/otp");

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  console.log(email);
  const record = await otpSchema.findOne({ email: email });
  if (record) {
    console.log(record.otp, otp);
    if (record.otp == otp) {
      const newuser = new RFP_user_details({
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        email: req.session.email,
        password: req.session.password,
        user_type: "admin",
      });
      await newuser.save();
      res.send({ message: "Signup Successful." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
