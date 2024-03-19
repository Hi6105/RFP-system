const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/rfpUserDetails");
const RFP_vendor_details = require("../models/rfpVendorDetail");
const bcrypt = require("bcryptjs");

let userID, userType;

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // Validating received data
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = {};

  if (email === "" || !emailRegex.test(email)) {
    errors.emailError =
      email === ""
        ? "*Please enter the email"
        : "*Please enter the email in correct format i.e. 'abc@gmail.com'";
  }

  if (password === "") {
    errors.passwordError = "*Please enter the password";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation error", errors });
  }

  try {
    const record = await RFP_user_details.findOne({ email:email });

    if (!record) {
      return res.status(404).json({
        message: "User does not exist",
        errors: { emailError: "Email does not exist" },
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, record.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Password is wrong",
        errors: { passwordError: "Password is wrong" },
      });
    }

    let userType, userID;
    userID = record.userID;
    userType = record.userType;
    if (record.userType === "vendor") {
      const vendorRecord = await RFP_vendor_details.findOne({ userID:userID });
      console.log(vendorRecord);
      if (!vendorRecord || vendorRecord.status === "Rejected") {
        return res.status(403).json({
          message: "Vendor is not approved by admin",
          errors: { emailError: "Not approved by admin" },
        });
      }
    }

    req.session.userID = userID;
    req.session.userType = userType;
    req.session.companyID = record.companyID;

    return res.json({ message: "User Authenticated" });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { router, userID, userType };
