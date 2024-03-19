const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const RFP_List = require("../models/rfpList");
const { sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const { itemName, itemDescription, lastDate, minPrice, maxPrice, vendors, quantity } =
    req.body;

  const newRFP = new RFP_List({
    companyID: req.session.companyID,
    itemDescription: itemDescription,
    itemName: itemName,
    lastDate: lastDate,
    minPrice: minPrice,
    maxPrice: maxPrice,
    quantity:quantity,
  });

  let vendorsInRFP = [];
  //Logic to send email to all the vendors
  for (let i = 0; i < vendors.length; i++) {
    let record = await RFP_user_details.findOne({ email: vendors[i] });
    //sending mail to the selected vendor
    const emailMessage = `
    Hello ${record.firstName}

    You've received a RFP.
    Your RFP number is ${newRFP.rfpNo}.
    `;
    const subject = "RFP Recevied";
    sendMail(subject, vendors[i], emailMessage);
    vendorsInRFP.push({ userID: record.userID });
  }

  //Saving the RFP into the Database
  try {
    await newRFP.save();
  } catch (err) {
    console.log(err);
  }

  await RFP_List.findOneAndUpdate(
    { userID: newRFP.userID, rfpNo: newRFP.rfpNo },
    { vendors: vendorsInRFP }
  );

  res.send({ message: "REF created." });
});

module.exports = router;
