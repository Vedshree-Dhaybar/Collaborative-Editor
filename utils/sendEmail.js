// src/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendShareEmail = async (toEmail, documentLink, permission) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com", // Replace with your email
      pass: "your-email-password",  // Replace with your email password or app password
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: toEmail,
    subject: "You've been shared a document!",
    text: `You have been granted ${permission} access to a document. You can view it here: ${documentLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendShareEmail;
