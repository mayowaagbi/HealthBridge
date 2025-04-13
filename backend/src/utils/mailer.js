// require("dotenv").config();
// const nodemailer = require("nodemailer");
// const logger = require("./logger");

// // Debugging: Log environment variables (Avoid logging passwords!)
// // console.log("[Mailer] Environment Variables:", {
// //   SMTP_HOST: process.env.SMTP_HOST,
// //   SMTP_PORT: process.env.SMTP_PORT,
// //   SMTP_USER: process.env.SMTP_USER,
// //   EMAIL_FROM: process.env.EMAIL_FROM,
// // });

// // Mail transporter setup
// const transporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io", // Use the correct Mailtrap host
//   port: 2525, // Mailtrap supports 2525 and 587
//   auth: {
//     user: "64f7199805533d", // Use your Mailtrap credentials
//     pass: "2f51108c301221",
//   },
//   logger: true, // Logs SMTP transactions
//   debug: true,
// });

// /**
//  * Send an email
//  * @param {string} to - Recipient's email
//  * @param {string} subject - Email subject
//  * @param {string} html - Email HTML content
//  */
// const sendEmail = async (to, subject, html) => {
//   try {
//     await transporter.sendMail({
//       from: `"Campus Health" <${process.env.EMAIL_FROM}>`,
//       to,
//       subject,
//       html,
//     });
//     logger.info(`✅ Email successfully sent to ${to}`);
//   } catch (error) {
//     logger.error(`❌ Email sending failed to ${to}: ${error.message}`);
//     throw new Error("Email sending failed");
//   }
// };

// /**
//  * Generate a well-styled email template
//  * @param {string} title - Email header title
//  * @param {string} message - Body message
//  * @param {Object} appointment - Appointment details
//  */
// const generateStyledEmail = (title, message, appointment) => {
//   return `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
//       <div style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">
//         <h1 style="margin: 0; font-size: 24px;">${title}</h1>
//       </div>
//       <div style="padding: 20px; line-height: 1.6; color: #333;">
//         <p style="font-size: 18px;">${message}</p>
//         <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
//           <strong>Appointment Details:</strong>
//           <ul style="list-style-type: none; padding: 0;">
//             <li><strong>Date:</strong> ${new Date(
//               appointment.startTime
//             ).toLocaleDateString()}</li>
//             <li><strong>Time:</strong> ${new Date(
//               appointment.startTime
//             ).toLocaleTimeString()}</li>
//             <li><strong>Service:</strong> ${appointment.service}</li>
//           </ul>
//         </div>
//       </div>
//       <div style="text-align: center; padding: 15px; background: #eee;">
//         <p style="font-size: 14px; color: #555;">If you have any questions, please contact our support team.</p>
//       </div>
//     </div>
//   `;
// };

// /**
//  * Send Appointment Confirmation Email
//  * @param {Object} user - Recipient's user data
//  * @param {Object} appointment - Appointment details
//  */
// const sendAppointmentConfirmation = (user, appointment) => {
//   const title = "Appointment Confirmed";
//   const message = `Hello,<br>Your appointment with ${appointment.provider} has been confirmed.`;

//   const html = generateStyledEmail(title, message, appointment);

//   return sendEmail(user.email, "Appointment Confirmation", html);
// };

// /**
//  * Send Appointment Status Update Email
//  * @param {Object} user - Recipient's user data
//  * @param {Object} appointment - Appointment details
//  * @param {string} status - Status (CONFIRMED, CANCELED, DENIED)
//  */
// const sendAppointmentStatusEmail = (user, appointment, status, supportname) => {
//   const title = `Appointment ${status}`;
//   const message = `Hello,<br>Your appointment with ${supportname} has been <strong>${status.toLowerCase()}</strong>.`;

//   const html = generateStyledEmail(title, message, appointment);

//   return sendEmail(user.email, `Appointment ${status}`, html);
// };

// module.exports = {
//   sendEmail,
//   sendAppointmentConfirmation,
//   sendAppointmentStatusEmail,
// };
require("dotenv").config();
const nodemailer = require("nodemailer");
const logger = require("./logger");
const QRCode = require("qrcode"); // Add QR code library

// Mail transporter setup
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "64f7199805533d",
    pass: "2f51108c301221",
  },
  logger: true,
  debug: true,
});

/**
 * Send an email
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Campus Health" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`✅ Email successfully sent to ${to}`);
  } catch (error) {
    logger.error(`❌ Email sending failed to ${to}: ${error.message}`);
    throw new Error("Email sending failed");
  }
};

/**
 * Generate QR code as a data URL
 * @param {Object} appointment - Appointment details
 * @returns {Promise<string>} - QR code data URL
 */
const generateQRCode = async (appointment) => {
  try {
    // Create a JSON string with appointment details
    const appointmentData = JSON.stringify({
      id: appointment.id,
      userId: appointment.userId,
      service: appointment.service,
      startTime: appointment.startTime,
      provider: appointment.provider,
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(appointmentData);
    return qrCodeDataURL;
  } catch (error) {
    logger.error(`❌ QR code generation failed: ${error.message}`);
    return null;
  }
};

/**
 * Generate a well-styled email template
 * @param {string} title - Email header title
 * @param {string} message - Body message
 * @param {Object} appointment - Appointment details
 * @param {string} qrCodeDataURL - QR code data URL (optional)
 */
const generateStyledEmail = (
  title,
  message,
  appointment,
  qrCodeDataURL = null
) => {
  // QR code section - only include if QR code is provided
  const qrCodeSection = qrCodeDataURL
    ? `
    <div style="margin-top: 20px; text-align: center;">
      <h3>Your Appointment QR Code</h3>
      <p>Please present this QR code when you arrive for your appointment.</p>
      <img src="${qrCodeDataURL}" alt="Appointment QR Code" style="width: 200px; height: 200px;">
    </div>
  `
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="padding: 20px; line-height: 1.6; color: #333;">
        <p style="font-size: 18px;">${message}</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
          <strong>Appointment Details:</strong>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Date:</strong> ${new Date(
              appointment.startTime
            ).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(
              appointment.startTime
            ).toLocaleTimeString()}</li>
            <li><strong>Service:</strong> ${appointment.service}</li>
          </ul>
        </div>
        ${qrCodeSection}
      </div>
      <div style="text-align: center; padding: 15px; background: #eee;">
        <p style="font-size: 14px; color: #555;">If you have any questions, please contact our support team.</p>
      </div>
    </div>
  `;
};

/**
 * Send Appointment Confirmation Email
 * @param {Object} user - Recipient's user data
 * @param {Object} appointment - Appointment details
 */
const sendAppointmentConfirmation = async (user, appointment) => {
  const title = "Appointment Confirmed";
  const message = `Hello,<br>Your appointment with ${appointment.provider} has been confirmed.`;

  // Generate QR code for confirmed appointments
  const qrCodeDataURL = await generateQRCode(appointment);

  const html = generateStyledEmail(title, message, appointment, qrCodeDataURL);

  return sendEmail(user.email, "Appointment Confirmation", html);
};

/**
 * Send Appointment Status Update Email
 * @param {Object} user - Recipient's user data
 * @param {Object} appointment - Appointment details
 * @param {string} status - Status (CONFIRMED, CANCELED, DENIED)
 * @param {string} supportname - Name of the provider/support person
 */
const sendAppointmentStatusEmail = async (
  user,
  appointment,
  status,
  supportname
) => {
  const title = `Appointment ${status}`;
  const message = `Hello,<br>Your appointment with ${supportname} has been <strong>${status.toLowerCase()}</strong>.`;

  // Only generate QR code if status is CONFIRMED
  let qrCodeDataURL = null;
  if (status === "CONFIRMED") {
    qrCodeDataURL = await generateQRCode(appointment);
  }

  const html = generateStyledEmail(title, message, appointment, qrCodeDataURL);

  return sendEmail(user.email, `Appointment ${status}`, html);
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentStatusEmail,
};
