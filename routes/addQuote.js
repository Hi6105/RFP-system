const express = require("express");
const router = express.Router();
const RFP_quotes = require("../models/RFP_quotes");
const RFP_list = require("../models/RFP_list");
const RFP_user_details = require("../models/RFP_user_details");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hvishwakarma821@gmail.com",
    pass: "qtlx ovnm oitb uliz",
  },
});

router.post("/", async (req, res) => {
  const { vendorPrice, itemDescription, quantity, totalCost } = req.body;
  const vendorID = req.session.userID;
  const rfpNo = req.session.rfpNo;
  console.log(vendorID);
  const updatedRecord = await RFP_list.findOneAndUpdate(
    {
      rfpNo: rfpNo,
      "vendors.id": vendorID,
    },
    {
      $set: {
        "vendors.$.applied": true,
      },
    },
    {
      new: true,
    }
  );

  const userID = updatedRecord.userID;
  const adminUserRecord = await RFP_user_details.findOne({ _id: userID });
  const vendorUserRecord = await RFP_user_details.findOne({ _id: vendorID });
  const adminEmail = adminUserRecord.email;
  const vendorEmail = vendorUserRecord.email;
  const newQuote = new RFP_quotes({
    vendorID: vendorID,
    vendorPrice: vendorPrice,
    itemDescription: itemDescription,
    quantity: quantity,
    totalCost: totalCost,
  });
  await newQuote.save();

  const mailOptions = {
    from: vendorEmail,
    to: adminEmail,
    subject: "OTP for Email Verification",
    text: `Your OTP for email verification is:`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      res.send({ message: "Otp sent." });
    }
  });

  res.send({ message: "Quote Saved" });
});

module.exports = router;
