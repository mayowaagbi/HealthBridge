// controllers/HealthController.js
const HealthService = require("../services/HealthService");

class HealthController {
  static async getWeeklyHealthData(req, res) {
    console.log("GET /weekly request received");
    try {
      console.log("Authenticated user:", req.user);
      const userId = req.user.id;

      console.log(`Fetching weekly data for user ${userId}`);
      const weeklyData = await HealthService.getWeeklyHealthData(userId);

      console.log("Weekly data fetched successfully:", weeklyData);
      res.json(weeklyData);
    } catch (error) {
      console.error("Error in getWeeklyHealthData:", error);
      res.status(500).json({
        error: "Failed to fetch health data",
        details: error.message,
      });
    }
  }
}

module.exports = HealthController;
