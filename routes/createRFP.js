const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const RFP_List = require("../models/rfpList");
const { sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const { itemName, itemDescription, lastDate, minPrice, maxPrice, vendors } =
    req.body;
  console.log("HI", vendors);
  //Finding all the RFP's created till now
  const RFPlist = await RFP_List.find({});
  //Determining the RFP number for the creating RFP
  let rfpNo = RFPlist.length + 1;

  let vendorsInRFP = [];
  //Logic to send email to all the vendors
  for (let i = 0; i < vendors.length; i++) {
    console.log(vendors[i]);
    let record = await RFP_user_details.findOne({ email: vendors[i] });
    //sending mail to the selected vendor
    const emailMessage = `
    Hello ${record.firstName}

    You've received a RFP.
    Your RFP number is ${rfpNo}.
    `;
    const subject = "RFP Recevied";
    sendMail(subject, vendors[i], emailMessage);
    vendorsInRFP.push({ id: record._id });
  }
  console.log(vendorsInRFP);

  //Saving the RFP into the Database
  const newRFP = new RFP_List({
    userID: req.session.userID,
    rfpNo: rfpNo,
    itemDescription: itemDescription,
    itemName: itemName,
    lastDate: lastDate,
    minPrice: minPrice,
    maxPrice: maxPrice,
    vendors: vendorsInRFP,
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
