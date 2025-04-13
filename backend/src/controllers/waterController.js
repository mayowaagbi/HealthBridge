const WaterService = require("../services/WaterService");

class WaterController {
  static async setGoal(req, res) {
    try {
      const userId = req.user.id;
      const { target } = req.body;

      if (!target || target <= 0) {
        throw new Error("Invalid target provided.");
      }

      const waterGoal = await WaterService.setGoal(userId, target);
      res.status(200).json(waterGoal);
    } catch (error) {
      console.error("Error setting water goal:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async addIntake(req, res) {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      // Validate the amount
      if (amount === undefined || amount <= 0) {
        throw new Error("Invalid amount provided.");
      }

      const waterIntake = await WaterService.addIntake(userId, amount);
      res.status(200).json(waterIntake);
    } catch (error) {
      console.error("Error adding water intake:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await WaterService.getProgress(userId);
      res.status(200).json(progress);
    } catch (error) {
      console.error("Error fetching water progress:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = WaterController;
