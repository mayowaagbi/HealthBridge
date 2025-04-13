const BaseModel = require("./BaseModel");

class EmergencyContact extends BaseModel {
  constructor() {
    super("emergencyContact");
  }

  /**
   * Set primary contact
   * @param {string} contactId
   * @returns {Promise<Object>}
   */
  async setPrimaryContact(contactId) {
    return this.prisma.$transaction([
      this.prisma.emergencyContact.updateMany({
        where: { id: contactId },
        data: { priority: 1 },
      }),
      this.prisma.emergencyContact.updateMany({
        where: { id: { not: contactId } },
        data: { priority: { increment: 1 } },
      }),
    ]);
  }

  /**
   * Get primary contact
   * @param {string} profileId
   * @returns {Promise<Object>}
   */
  async getPrimaryContact(profileId) {
    return this.prisma.emergencyContact.findFirst({
      where: { profileId, priority: 1 },
    });
  }
}

module.exports = new EmergencyContact();
