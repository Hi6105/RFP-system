const express = require("express");
const router = express.Router();
const RFP_vendor_details = require("../models/RFP_vendor_details");
const RFP_user_details = require("../models/RFP_user_details");
const RFP_categories = require("../models/RFP_categories");
const otpSchema = require("../models/otp");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hvishwakarma821@gmail.com",
    pass: "qtlx ovnm oitb uliz",
  },
});

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  console.log(email);
  const record = await otpSchema.findOne({ email: email });
  if (record) {
    console.log(record.otp, otp);
    if (record.otp == otp) {
      const all = await RFP_vendor_details.find({});
      let serialNumber = all.length + 1;
      const newVendor = new RFP_vendor_details({
        serialNumber: serialNumber,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        email: req.session.email,
        password: req.session.password,
        revenue: req.session.revenue,
        numberOfEmployees: req.session.numberOfEmployees,
        GSTno: req.session.GSTno,
        PAN: req.session.PAN,
        phoneNumber: req.session.phoneNumber,
        category: req.session.category,
      });
      await newVendor.save();
      const newUser = new RFP_user_details({
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        email: req.session.email,
        password: req.session.password,
        user_type: "vendor",
      });
      await newUser.save();
      const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Registration Successful!",
        text: `
        Hello ${newUser.firstName},

        Thank you for joining RFP Management


        We'd like to confirm that your account was created successfully.
        `,
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
      res.send({ message: "Registration Successful." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
