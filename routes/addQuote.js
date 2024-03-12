const express = require("express");
const router = express.Router();
const RFP_quotes = require("../models/RFP_quotes");
const RFP_list = require("../models/RFP_list");
const RFP_user_details = require("../models/RFP_user_details");
const { sendMail } = require("./sendMail");

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
    rfpNo: rfpNo,
    vendorID: vendorID,
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
