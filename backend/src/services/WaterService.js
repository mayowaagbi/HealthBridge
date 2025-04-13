const WaterModel = require("../models/WaterModel");

class WaterService {
  static async setGoal(userId, target) {
    if (!userId || !target) {
      throw new Error("Missing required fields.");
    }

    return WaterModel.setGoal(userId, target);
  }

  static async addIntake(userId, amount) {
    if (!userId || amount === undefined || amount <= 0) {
      throw new Error("Missing or invalid fields.");
    }

    return WaterModel.addIntake(userId, amount);
  }

  static async getProgress(userId) {
    if (!userId) {
      throw new Error("Missing required fields.");
    }

    return WaterModel.getProgress(userId);
  }
}

module.exports = WaterService;
