const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
// const transporter = nodemailer.createTransport({

//   host: process.env.SMTP_HOST,

//   port: process.env.SMTP_PORT,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Use the correct Mailtrap host
  port: 2525, // Mailtrap supports 2525 and 587
  auth: {
    user: "64f7199805533d", // Use your Mailtrap credentials
    pass: "2f51108c301221",
  },
  logger: true, // Logs SMTP transactions
  debug: true,
});
console.log(process.env.SMTP_HOST);

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Campus Health" <${process.env.EMAIL_FROM}>`,
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email from Nodemailer.",
      html: "<b>This is a test email from Nodemailer by Mayovibe1.</b>",
    });

    console.log("Email sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

sendTestEmail();
