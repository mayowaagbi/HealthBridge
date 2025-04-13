const BaseModel = require("./BaseModel");

class ProviderQualification extends BaseModel {
  constructor() {
    super("providerQualification");
  }

  /**
   * Add qualification with validation
   * @param {string} providerId
   * @param {Object} qualification
   * @returns {Promise<Object>}
   */
  async addQualification(
    providerId,
    { qualification, institution, yearObtained }
  ) {
    return this.prisma.providerQualification.create({
      data: {
        provider: { connect: { id: providerId } },
        qualification,
        institution,
        yearObtained: parseInt(yearObtained),
      },
    });
  }

  /**
   * Get qualifications with provider details
   * @param {string} providerId
   * @returns {Promise<Array>}
   */
  async getQualificationsWithProvider(providerId) {
    return this.prisma.providerQualification.findMany({
      where: { providerId },
      include: { provider: { include: { profile: true } } },
    });
  }
}

module.exports = new ProviderQualification();
