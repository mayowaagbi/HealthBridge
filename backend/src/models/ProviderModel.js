const BaseModel = require("./BaseModel");
// const prisma = require("../utils/prisma");

class ProviderModel extends BaseModel {
  constructor() {
    super("providerDetails");
  }
  async findByUserId(userId) {
    try {
      return await this.prisma.providerDetails.findFirst({
        where: {
          profile: {
            userId: userId, // Traverse the profile relation to access userId
          },
        },
        include: {
          profile: true, // Include the profile details
        },
      });
    } catch (error) {
      console.error("[Provider Model] Error finding provider:", error);
      throw error;
    }
  }
}

module.exports = new ProviderModel();
