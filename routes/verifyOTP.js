const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const otpSchema = require("../models/otp");
const rfpCompany = require("../models/company");

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  const record = await otpSchema.findOne({ email: email });
  if (record) {
    if (record.otp == otp) {
      let companyID;
        const newCompany = new rfpCompany({
          companyName: req.session.companyName,
        });
        await newCompany.save();
        companyID = newCompany.companyID;

      const newuser = new RFP_user_details({
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        email: req.session.email,
        password: req.session.password,
        userType: req.session.userType,
        companyID: companyID,
      });
      await newuser.save();
      res.send({ message: "Signup Successful." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
