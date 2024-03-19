const express = require("express");
const router = express.Router();

/**
 *  Setting Admin role before signup
 */
router.post("/", async (req, res) => {
  const { company } = req.body;
  req.session.companyName = company;
  res.json({ message: "Company Selected" });
});

module.exports = router;
