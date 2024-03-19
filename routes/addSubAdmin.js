const express = require("express");
const router = express.Router();
const rfpUserDetails = require("../models/rfpUserDetails");
const rfpCompany = require("../models/company");
const { sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  console.log(req.body);
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
  if (role == "") {
    errors.roleError = `*Both the passwords must match`;
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

  const company = await rfpCompany.findOne({
    companyName: req.session.companyName,
  });

  const generatePassword = () => {
    const initialLetter = "Velocity";
    const randomLetters = generateRandomLetters(8); // Adjust the length of random letters as needed
    return initialLetter + randomLetters;
  };

  const generateRandomLetters = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  // Example usage
  const password = generatePassword();

  /**
   * Saving sub admin to the database.
   */

  const newUser = new rfpUserDetails({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    userType: role,
    companyID: company.companyID,
  });

  await newUser.save();

  //sending mail to the receiver
  const emailMessage = `
  Hi ${firstName},

  You have been added as the ${role} for ${req.session.companyName}.

  Your credentials for login are -

  Email - ${email}
  Password - ${password}
  `;
  const subject = `Assigning access role for ${role}.`;
  sendMail(subject, email, emailMessage);
  res.send({ message: "Otp sent." });
});

module.exports = router;
