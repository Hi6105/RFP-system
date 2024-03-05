const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/RFP_user_details");
const otpSchema = require("../models/otp");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

const secret = speakeasy.generateSecret({ length: 10 });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hvishwakarma821@gmail.com",
    pass: "qtlx ovnm oitb uliz",
  },
});

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  //Email and Password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    res.send({ message: "Invalid email address" });
  }
  if (password.length < 8) {
    res.send({ message: "Length of the password must be greater that 8." });
  }
  if (password !== confirmPassword) {
    res.send({ message: "Both the passwords does not match." });
  }

  //Check if user already exists
  const record = await RFP_user_details.findOne({ email: email });

  if (record) {
    res.send({ message: "User with this email already exists." });
  }

  //Generate OTP to verify
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });

  //saving otp into DB
  const recordotp = await otpSchema.findOne({ email: email });
  if (recordotp) {
    await otpSchema.findOneAndUpdate(
      { email: email },
      { otp: otp },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    const newotp = new otpSchema({
      email: email,
      otp: otp,
    });
    await newotp.save();
  }

  //sending mail to the receiver
  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: email,
    subject: "OTP for Email Verification",
    text: `Your OTP for email verification is: ${otp}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      req.session.email = email;
      req.session.firstName = firstName;
      req.session.lastName = lastName;
      req.session.password = password;
      res.send({ message: "Otp sent." });
    }
  });
});

module.exports = router;
