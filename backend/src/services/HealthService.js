// services/HealthService.js
const geoModel = require("../models/geoModel");
const WaterModel = require("../models/WaterModel");
const { getPastWeekDates } = require("../utils/dateHelpers");

class HealthService {
  static async getWeeklyHealthData(userId) {
    console.log(`Starting health data fetch for user ${userId}`);

    try {
      const dateRange = getPastWeekDates();
      console.log("Date range:", dateRange);

      const weeklyData = [];
      console.log("Processing", dateRange.length, "days");

      for (const date of dateRange) {
        console.log(`Processing date: ${date.toISOString()}`);

        const [stepsEntry, waterEntry] = await Promise.all([
          geoModel.getStepsByDate(userId, date),
          WaterModel.getWaterByDate(userId, date),
        ]);

        console.log(`Date ${date.toISOString()} results:`, {
          stepsEntry,
          waterEntry,
        });

        weeklyData.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          steps: stepsEntry?.steps || 0,
          calories: Math.round((stepsEntry?.steps || 0) * 0.04),
          waterIntake: waterEntry?.current || 0,
        });
      }

      console.log("Completed weekly data processing");
      return weeklyData;
    } catch (error) {
      console.error("Error in HealthService.getWeeklyHealthData:", error);
      throw new Error(`Health service error: ${error.message}`);
    }
  }
}

module.exports = HealthService;
