const BaseModel = require("./BaseModel");

class GeoModel extends BaseModel {
  constructor() {
    super("userLocation");
  }

  async getPreviousLocation(userId) {
    return await this.prisma.userLocation.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });
  }

  async saveNewLocation(userId, location) {
    return await this.prisma.userLocation.create({
      data: {
        userId,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date(), // Ensure timestamp is set
      },
    });
  }

  async upsertStepEntry(userId, steps) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return await this.prisma.stepEntry.upsert({
      where: { userId_date: { userId, date: today } },
      update: { steps: { increment: steps } },
      create: { userId, steps, date: today, source: "GEO" },
    });
  }

  // New method for resetting steps
  async updateStepEntry(userId, date, stepsValue) {
    return await this.prisma.stepEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { steps: stepsValue },
      create: { userId, steps: stepsValue, date, source: "RESET" },
    });
  }

  async getStepsByDate(userId, date) {
    console.log(`Fetching steps for ${userId} on ${date}`);
    try {
      return await this.prisma.stepEntry.findUnique({
        where: {
          userId_date: {
            userId,
            date: new Date(date.setUTCHours(0, 0, 0, 0)),
          },
        },
      });
    } catch (error) {
      console.error("Error in getStepsByDate:", error);
      throw error;
    }
  }

  async updateDailyGoal(userId, date, target) {
    return this.prisma.stepEntry.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        steps: target,
      },
      create: {
        userId,
        date,
        steps: target,
        source: "MANUAL",
      },
    });
  }

  async getProgress(userId) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.prisma.stepEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
  }
}

module.exports = new GeoModel();
