const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AutoIncrement = require("mongoose-sequence")(mongoose);

/**
 * Funtion to return either true or false
 * based on the mathces with their corresponding regular expressions.
 */
const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const rfpUserDetailsSchema = new mongoose.Schema({
  userID: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

// Encrypt password before saving
rfpUserDetailsSchema.pre("save", async function (next) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    const passwordHash = await bcrypt.hash(this.password, salt);
    // Replace plain password with the hashed one
    this.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

// Add auto-increment functionality to userID
rfpUserDetailsSchema.plugin(AutoIncrement, { inc_field: "userID" });

const rfpUserDetails = mongoose.model("rfp_user_details", rfpUserDetailsSchema);

module.exports = rfpUserDetails;
