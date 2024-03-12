const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const otpSchema = require("../models/otp");

/**
 *
 * @returns int
 */
function generateOtp() {
  const secret = speakeasy.generateSecret({ length: 10 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });
  return otp;
}

async function saveOtpToDatabase(email, otp) {
  //
  const recordotp = await otpSchema.findOne({ email: email });
  if (recordotp) {
    await otpSchema.findOneAndUpdate(
      { email: email },
      { otp: otp },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    //
    const newotp = new otpSchema({
      email: email,
      otp: otp,
    });
    await newotp.save();
  }
}

const sendMail = (subject, ReceiverEmail, emailMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Mail_User_Id,
      pass: process.env.Mail_password,
    },
  });
  const mailOptions = {
    from: process.env.Mail_User_Id,
    to: ReceiverEmail,
    subject: subject,
    text: emailMessage,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { saveOtpToDatabase, sendMail, generateOtp };
