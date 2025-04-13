const BaseModel = require("./BaseModel");
const { startOfDay, endOfDay, format } = require("date-fns");

class HealthModel extends BaseModel {
  constructor() {
    super("stepEntry");
  }

  async getSteps(userId, date) {
    // Convert the date to the start of day and ensure it's in the right format
    const dayStart = startOfDay(date);

    return this.prisma.stepEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
    });
  }

  async getWaterIntake(userId, date) {
    // Convert the date to the start of day and ensure it's in the right format
    const dayStart = startOfDay(date);

    return this.prisma.waterGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
    });
  }

  async getUserEntries(userId, date) {
    // Convert dates for range query
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return this.prisma.userEntry.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
  }

  // Debug method to help diagnose issues
  async debugDateQuery(userId, date) {
    console.log("Debug query with:", {
      userId,
      date,
      dateObject: new Date(date),
      startOfDay: startOfDay(date),
      endOfDay: endOfDay(date),
      isoString: new Date(date).toISOString(),
    });

    // Try different query approaches to see which one works
    const results = {
      withDateObject: await this.prisma.stepEntry.findMany({
        where: {
          userId,
          date: startOfDay(date),
        },
        take: 1,
      }),

      withRawISOString: await this.prisma.stepEntry.findMany({
        where: {
          userId,
          date: new Date(date).toISOString(),
        },
        take: 1,
      }),

      withDateRange: await this.prisma.stepEntry.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay(date),
            lt: endOfDay(date),
          },
        },
        take: 1,
      }),
    };

    console.log("Debug results:", results);
    return results;
  }
}

module.exports = new HealthModel();
