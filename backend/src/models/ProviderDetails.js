const BaseModel = require("./BaseModel");

class ProviderDetails extends BaseModel {
  constructor() {
    super("providerDetails");
  }

  /**
   * Get provider's full profile with qualifications and schedule
   * @param {string} providerId - UUID of the provider
   * @returns {Promise<Object>} Complete provider profile
   */
  async getFullProviderProfile(providerId) {
    return this.prisma.providerDetails.findUnique({
      where: { id: providerId },
      include: {
        profile: true,
        qualifications: true,
        schedules: true,
        healthRecords: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Add new qualification for a provider
   * @param {string} providerId - UUID of the provider
   * @param {Object} qualificationData - Qualification details
   * @returns {Promise<Object>} Created qualification
   */
  async addQualification(providerId, qualificationData) {
    return this.prisma.providerQualification.create({
      data: {
        provider: { connect: { id: providerId } },
        ...qualificationData,
      },
    });
  }

  /**
   * Get provider's availability schedule
   * @param {string} providerId - UUID of the provider
   * @returns {Promise<Array>} List of availability slots
   */
  async getAvailability(providerId) {
    return this.prisma.availabilitySchedule.findMany({
      where: { providerId },
      orderBy: { startTime: "asc" },
    });
  }
}

module.exports = new ProviderDetails();
