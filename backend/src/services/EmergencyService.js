const { EmergencyContact } = require("../models/EmergencyContact");
const { sendSMS } = require("../utils/smsService");
const { ApiError } = require("../utils/apiError");
const logger = require("../utils/logger");
class EmergencyService {
  async triggerEmergency(studentId, location) {
    const contacts = await EmergencyContact.findByStudent(studentId);
    if (!contacts.length) {
      throw new ApiError(400, "No emergency contacts registered");
    }

    const message = `EMERGENCY ALERT: ${studentId} needs help at ${location}`;
    const sendPromises = contacts.map((contact) =>
      sendSMS(contact.phone, message)
    );

    await Promise.all(sendPromises);
    logger.info(`Emergency alert sent for student ${studentId}`);
    return { success: true };
  }
}

module.export = new EmergencyService();
