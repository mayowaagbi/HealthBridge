const HealthModel = require("../models/dailyHealthModel");
const { startOfDay, endOfDay } = require("date-fns");

class HealthService {
  async getDailyHealthData(userId, date) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const [stepEntry, waterGoal, userEntries] = await Promise.all([
      HealthModel.getSteps(userId, date),
      HealthModel.getWaterIntake(userId, date),
      HealthModel.getUserEntries(userId, date),
    ]);

    return {
      date: startDate,
      steps: stepEntry?.steps || 0,
      waterIntake: waterGoal?.current || 0,
      mood: userEntries.find((e) => e.type === "MOOD")?.mood || null,
      journal: userEntries.find((e) => e.type === "JOURNAL")?.journal || null,
    };
  }
}

module.exports = new HealthService();
