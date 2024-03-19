const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { category } = req.body;
  req.session.category = category;
  res.send({ message: "Category selected." });
});

module.exports = router;
