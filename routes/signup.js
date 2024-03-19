const express = require("express");
const router = express.Router();
const rfpUserDetails = require("../models/rfpUserDetails");
const otpSchema = require("../models/otp");
const { saveOtpToDatabase, sendMail, generateOtp } = require("./sendMail");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, companyName } =
    req.body;

  //Email and Password validation
  let flag = false;
  let errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (firstName == "") {
    errors.firstNameError = `*Please enter the First Name`;
    flag = true;
  }
  if (lastName == "") {
    errors.lastNameError = `*Please enter the Last Name`;
    flag = true;
  }
  if (!emailRegex.test(email)) {
    errors.emailError = `*Please enter the email in correct format i.e. "abc@gmail.com"`;
    flag = true;
  }
  if (password.length < 8) {
    errors.passwordError = `*Length of password must be greater than 8`;
    flag = true;
  }
  if (password !== confirmPassword) {
    errors.confirmPasswordError = `*Both the passwords must match`;
    flag = true;
  }
  if (companyName == "") {
    errors.companyNameError = `*Both the passwords must match`;
    flag = true;
  }

  if (flag) {
    res.status(400).json({ message: "Error", errors: errors });
  }
  //Check if user already exists
  const record = await rfpUserDetails.findOne({ email: email });

  if (record) {
    res.status(400)({
      message: "User with this email already exists.",
      errors: { emailError: "*User with this email already exists." },
    });
  }

  //Generating an OTP
  const otp = generateOtp();
  //saving otp into DB
  saveOtpToDatabase(email, otp);

  //sending mail to the receiver
  const emailMessage = `Your OTP for email verification is: ${otp}`;
  const subject = "OTP for Email Verification";
  sendMail(subject, email, emailMessage);
  req.session.email = email;
  req.session.firstName = firstName;
  req.session.lastName = lastName;
  req.session.password = password;
  req.session.companyName = companyName;
  req.session.userType = "Super Admin";
  res.send({ message: "Otp sent." });
});

module.exports = router;
