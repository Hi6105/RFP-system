const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/RFP_user_details");

let userID, userType;

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const record = await RFP_user_details.findOne({ email: email });
  if (record) {
    console.log(record);
    if (password === record.password) {
      userID = record._id;
      userType = record.user_type;
      req.session.userID = userID;
      req.session.userType = userType;
      console.log(userID);
      res.send({ message: "User Authenticated." });
    } else {
      res.send({ message: "Password is Wrong." });
    }
  } else {
    res.send({ message: "User does not exists." });
  }
});

module.exports = { router, userID, userType };
