const twilio = require("twilio");
const logger = require("./logger");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}`);
  } catch (error) {
    logger.error(`SMS failed to ${to}: ${error.message}`);
    throw new Error("SMS sending failed");
  }
};

const sendEmergencyAlert = (phoneNumber, location) => {
  const message = `EMERGENCY ALERT: Assistance needed at ${location}`;
  return sendSMS(phoneNumber, message);
};
module.exports = { sendSMS, sendEmergencyAlert };
