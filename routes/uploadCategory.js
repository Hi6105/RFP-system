const express = require("express");
const multer = require("multer");
const router = express.Router();
const excelToJson = require("convert-excel-to-json");
const rfpCategories = require("../models/rfpCategories");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/category/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("uploadFile"), async (req, res) => {
  console.log(req.file.mimetype);
  const filePath =
    path.join(__dirname, "../public/category/") + req.file.filename;
  console.log(filePath);
  const excelData = excelToJson({
    sourceFile: filePath,
    sheets: [
      {
        name: "Sheet1",
        header: {
          rows: 1,
        },
        columnToKey: {
          B: "categoryName",
        },
      },
    ],
  });

  /**
   * In the excelData Sheet1 has an array of all category names
   */
  for (let i = 0; i < excelData.Sheet1.length; i++) {
    const category = excelData.Sheet1[i].categoryName;

    /**
     * Storing each record from category names in excel sheet into the categories collection in mongodb
     */
    const newCategory = new rfpCategories({
      companyID:req.session.companyID,
      categoryName: category,
    });
    await newCategory.save();
  }
});

module.exports = router;
