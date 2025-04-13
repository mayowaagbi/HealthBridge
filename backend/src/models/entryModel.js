const BaseModel = require("./BaseModel");

class EntryModel extends BaseModel {
  constructor() {
    super("userEntry"); // Ensure this matches your Prisma model name
  }

  async createEntry(userId, mood, journal) {
    // Determine the type based on the input
    const type = mood ? "MOOD" : "JOURNAL";

    return await this.prisma.userEntry.create({
      data: {
        userId,
        type, // Include the type field
        mood,
        journal,
      },
    });
  }

  async getEntries(userId) {
    return await this.prisma.userEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = new EntryModel();
