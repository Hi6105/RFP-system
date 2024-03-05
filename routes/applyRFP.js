const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { rfpNo } = req.body;
  req.session.rfpNo = rfpNo;
  res.send("Ok");
});

module.exports = router;
