const express = require("express");
const router = express.Router();
const RFP_List = require("../models/rfpList");

router.use("/", async (req, res) => {
  try {
    const companyID = req.session.companyID;
    const RFPList = await RFP_List.find({companyID:companyID});

    const headers = [
      "RFP No.",
      "RFP Title",
      "RFP Last Date",
      "Min Amount",
      "Max Amount",
      "Status",
    ];

    // Map each RFP object to CSV format
    let csvData = RFPList.map((rfp) => {
      return `${rfp.rfpNo},${rfp.itemName},${rfp.lastDate.toDateString()},${
        rfp.minPrice
      },${rfp.maxPrice},${rfp.status}`;
    });

    // Join headers and CSV data
    csvData = [headers.join(","), ...csvData].join("\n");

    res.setHeader("Content-disposition", "attachment; filename=RFP_List.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvData);
  } catch (error) {
    console.error("Error occurred while downloading RFP list:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
