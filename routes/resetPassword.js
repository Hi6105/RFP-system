const express = require("express");
const router = express.Router();
const RFP_user_details = require("../models/RFP_user_details");

router.post("/", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.email;
  console.log(email);
  if (password !== confirmPassword)
    res.send({ message: "Both the passwords does not match." });
  else {
    await RFP_user_details.findOneAndUpdate(
      { email: email },
      { password: password }
    );
    res.send({ message: "Password updated." });
  }
});

module.exports = router;
