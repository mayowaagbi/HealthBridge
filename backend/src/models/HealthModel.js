const BaseModel = require("./BaseModel");

class HealthModel extends BaseModel {
  constructor() {
    super("HealthData"); // Replace with your actual Prisma model name
  }

  static async getWeeklyHealthData(userId) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)

    return this.prisma.healthData.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
          lte: today,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}

module.exports = HealthModel;
