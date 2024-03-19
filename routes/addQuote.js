const express = require("express");
const router = express.Router();
const RFP_quotes = require("../models/rfpQuotes");
const RFP_list = require("../models/rfpList");
const RFP_user_details = require("../models/rfpUserDetails");
const { sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const { vendorPrice, itemDescription, quantity, totalCost } = req.body;
  const vendorID = req.session.userID;
  const rfpNo = req.session.rfpNo;
  console.log(vendorID);
  const updatedRecord = await RFP_list.findOneAndUpdate(
    {
      rfpNo: rfpNo,
      "vendors.userID": vendorID,
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

  const companyID = updatedRecord.companyID;
  const adminUserRecord = await RFP_user_details.findOne({ companyID: companyID,userType: "Super Admin" });
  const vendorUserRecord = await RFP_user_details.findOne({ userID: vendorID });
  const adminEmail = adminUserRecord.email;
  const newQuote = new RFP_quotes({
    companyID:req.session.companyID,
    rfpNo: rfpNo,
    userID: vendorUserRecord.userID,
    vendorPrice: vendorPrice,
    itemDescription: itemDescription,
    quantity: quantity,
    totalCost: totalCost,
  });
  await newQuote.save();

  const emailMessage = `
  Hello ${adminUserRecord.firstName},

  You've received a quote for your RFP number : ${rfpNo}
  `;
  const subject = `Quote Received against your RFP`;
  sendMail(subject, adminEmail, emailMessage);

  res.send({ message: "Quote Saved" });
});

module.exports = router;
