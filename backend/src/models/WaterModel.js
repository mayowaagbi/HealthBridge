const BaseModel = require("./BaseModel");
const MIN_WATER_ML = require("../constants/health").MIN_WATER_ML;
class WaterModel extends BaseModel {
  constructor() {
    super("waterGoal");
  }

  // Instance method to add water intake (in milliliters)
  async addIntake(userId, amount) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to start of the day

    return this.prisma.waterGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        current: {
          increment: amount,
        },
      },
      create: {
        userId,
        current: amount,
        date: today,
      },
    });
  }

  // Instance method to get the current progress (water intake) for today
  // async getProgress(userId) {
  //   const today = new Date();
  //   today.setUTCHours(0, 0, 0, 0);

  //   return this.prisma.waterGoal.findUnique({
  //     where: {
  //       userId_date: {
  //         userId,
  //         date: today,
  //       },
  //     },
  //   });
  // }
  async getProgress(userId) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = await this.prisma.waterGoal.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return (
      result || {
        userId,
        date: today,
        current: 0,
        target: MIN_WATER_ML, // Default target
      }
    );
  }
  async getWaterByDate(userId, date) {
    console.log(`Fetching water intake for ${userId} on ${date}`);
    try {
      return await this.prisma.waterGoal.findUnique({
        where: {
          userId_date: {
            userId,
            date: new Date(date.setUTCHours(0, 0, 0, 0)),
          },
        },
      });
    } catch (error) {
      console.error("Error in getWaterByDate:", error);
      throw error;
    }
  }

  async upsertTarget(userId, date, target) {
    return this.prisma.waterGoal.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        target,
      },
      create: {
        userId,
        date,
        target,
        current: 0, // Initialize current to 0
      },
    });
  }
}

module.exports = new WaterModel();
