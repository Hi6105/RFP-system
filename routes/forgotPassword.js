const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const { saveOtpToDatabase, sendMail, generateOtp } = require("./sendMail");

router.post("/", async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    res.send({ message: "Invalid email address" });
  }

  const userRecord = await RFP_user_details.findOne({ email: email });

  if (userRecord) {
    //Generating an OTP
    const otp = generateOtp();
    //saving otp into DB
    saveOtpToDatabase(email, otp);

    //sending mail to the receiver
    const emailMessage = `Your OTP for email verification is: ${otp}`;
    const subject = "OTP for Email Verification";
    sendMail(subject, email, emailMessage);
    req.session.email = email;
    res.send({ message: "Otp sent." });
  } else {
    res.send({ message: "User does not exists." });
  }
});

module.exports = router;
