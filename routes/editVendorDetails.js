const express = require("express");
const router = express.Router();
const multer = require("multer");
const RFP_user_details = require("../models/RFP_user_details");
const RFP_vendor_details = require("../models/RFP_vendor_details");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  const {
    firstName,
    lastName,
    revenue,
    numberOfEmployees,
    GSTno,
    PAN,
    phoneNumber,
    category,
  } = req.body;

  //Email and Password validation
  let flag = false;
  let errors = {};

  if (firstName == "") {
    errors.firstNameError = `*Please enter the First Name`;
    flag = true;
  }
  if (lastName == "") {
    errors.lastNameError = `*Please enter the Last Name`;
    flag = true;
  }
  if (revenue == "") {
    errors.revenueError = `*Both the passwords must match`;
    flag = true;
  }
  if (numberOfEmployees == "") {
    errors.numberOfEmployeesError = `*Both the passwords must match`;
    flag = true;
  }
  if (GSTno == "") {
    errors.GSTerror = `*Both the passwords must match`;
    flag = true;
  }
  if (PAN == "") {
    errors.PANError = `*Both the passwords must match`;
    flag = true;
  }
  if (phoneNumber == "") {
    errors.phoneNumberError = `*Both the passwords must match`;
    flag = true;
  }
  if (category == "") {
    errors.categoryError = `*Both the passwords must match`;
    flag = true;
  }
  if (flag) {
    res.send({ message: "Error", errors: errors });
  }

  await RFP_user_details.findOneAndUpdate(
    { _id: req.session.userID },
    {
      firstName: firstName,
      lastName: lastName,
    }
  );

  console.log(req.file.buffer);
  await RFP_vendor_details.findOneAndUpdate(
    { vendorID: req.session.userID },
    {
      firstName: firstName,
      lastName: lastName,
      revenue: revenue,
      numberOfEmployees: numberOfEmployees,
      GSTno: GSTno,
      PAN: PAN,
      phoneNumber: phoneNumber,
      category: category,
      image: {
        data: req.file.buffer, // Image data
        contentType: req.file.mimetype, // Image MIME type
      },
    }
  );
  res.send({ message: "Details updated" });
});

module.exports = router;
