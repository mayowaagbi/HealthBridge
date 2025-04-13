const providerModel = require("../models/ProviderModel");
class ProviderService {
  async findByUserId(userId) {
    return await providerModel.findByUserId(userId);
  }
  async findProviderByUserId(userId) {
    console.log("[StudentService] Searching for student with userId:", userId);

    try {
      // Find the profile associated with the user
      const profile = await providerModel.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) throw new Error("Profile not found");

      // Find the student associated with the profile
      const provider = await providerModel.prisma.providerDetails.findUnique({
        where: { profileId: profile.id },
      });

      if (!provider)
        throw new Error(`No provider found for profileId: ${profile.id}`);

      return provider;
    } catch (error) {
      console.error("providerService Error:", error);
      throw new Error("Failed to find provider");
    }
  }
}

module.exports = new ProviderService();
