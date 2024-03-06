const express = require("express");
const router = express.Router();
const RFP_vendor_details = require("../models/RFP_vendor_details");
const RFP_List = require("../models/RFP_list");
const otpSchema = require("../models/otp");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hvishwakarma821@gmail.com",
    pass: "qtlx ovnm oitb uliz",
  },
});

router.post("/", async (req, res) => {
  const { itemName, itemDescription, lastDate, minPrice, maxPrice } = req.body;

  let emails = [];
  let extractedData = req.session.extractedData;
  console.log(req.session.extractedData);
  for (let i = 0; i < extractedData.length; i++) {
    emails.push(extractedData[i].email);
  }
  console.log(emails);

  const RFPlist = await RFP_List.find({});
  let rfpNo = RFPlist.length + 1;

  let vendors = [];
  for (let i = 0; i < emails.length; i++) {
    let record = await RFP_vendor_details.findOne({ email: emails[i] });
    //sending mail to the receiver
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: emails[i],
      subject: "RFP Recevied",
      text: `
      Hello ${record.firstName}

      You've received a RFP.
      Your RFP number is ${rfpNo}.
      `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    vendors.push({ id: record._id });
  }
  console.log(vendors);

  const newRFP = new RFP_List({
    userID: req.session.userID,
    rfpNo: rfpNo,
    itemDescription: itemDescription,
    itemName: itemName,
    lastDate: lastDate,
    minPrice: minPrice,
    maxPrice: maxPrice,
    vendors: vendors,
  });
  try {
    await newRFP.save();
    console.log("saved");
  } catch (err) {
    console.log(err);
  }

  res.send({ message: "REF created." });
});

module.exports = router;
