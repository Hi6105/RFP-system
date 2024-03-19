const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const RFP_user_details = require("../models/rfpUserDetails");
const RFP_vendor_details = require("../models/rfpVendorDetail");

// Set up Multer storage with desired options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Save uploaded files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Set filename to include original name and .jpg extension
    cb(
      null,
      file.originalname.replace(path.extname(file.originalname), "") +
        "-" +
        Date.now() +
        ".jpg"
    );
  },
});

// Initialize Multer upload with configured storage
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

  const vendor = await RFP_user_details.findOne({ userID: req.session.userID });
  const uniqueFileName = req.file.originalname + `/${vendor.userID}`;

  console.log(uniqueFileName, req.file.path);

  const data = await RFP_vendor_details.findOneAndUpdate(
    { userID: vendor.userID },
    {
      $set: {
        revenue: revenue,
        numberOfEmployees: numberOfEmployees,
        GSTno: GSTno,
        PAN: PAN,
        phoneNumber: phoneNumber,
        category: category,
        "image.imageName": uniqueFileName,
        "image.path": req.file.path,
      },
    },
    {
      new: true,
      upsert: true, // Make this update into an upsert
    }
  );
  console.log(data);
  res.send({ message: "Details updated" });
});

module.exports = router;
