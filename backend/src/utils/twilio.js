// utils/twilio.js
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error("Twilio error:", error);
    throw error;
  }
};
module.exports = { sendSMS };
