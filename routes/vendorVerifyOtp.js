const express = require("express");
const router = express.Router();
const rfpVendorDetail = require("../models/rfpVendorDetail");
const rfpUserDetails = require("../models/rfpUserDetails");
const otpSchema = require("../models/otp");
const { sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  const record = await otpSchema.findOne({ email: email });

  if (record && record.otp === otp) {
    try {
      // Create a new user
      const newUser = new rfpUserDetails({
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        email: req.session.email,
        password: req.session.password,
        userType: "vendor", // Corrected field name
      });
      // Save the new user
      await newUser.save();

      // Create a new vendor detail with the user's ID
      const newVendor = new rfpVendorDetail({
        userID: newUser.userID, // Assign the auto-incremented userID from newUser
        revenue: req.session.revenue,
        numberOfEmployees: req.session.numberOfEmployees,
        GSTno: req.session.GSTno,
        PAN: req.session.PAN,
        phoneNumber: req.session.phoneNumber,
        category: req.session.category,
      });
      // Save the new vendor detail
      await newVendor.save();

      //sending mail to the user
      const emailMessage = `
      Hello ${newUser.firstName},
      Thank you for joining RFP Management.
      We'd like to confirm that your account was created successfully.`;
      const subject = "Registration Successful!";
      await sendMail(subject, email, emailMessage);

      res.send({ message: "Registration Successful." });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).send({
      message: "Otp does not match",
      errors: { otpError: "Otp does not match" },
    });
  }
});

module.exports = router;
