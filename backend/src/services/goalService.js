const WaterModel = require("../models/WaterModel");
const UserModel = require("../models/User");
const { MIN_STEPS, MIN_WATER_ML } = require("../constants/health");

class GoalService {
  async updateGoal(userId, type, target) {
    const numericTarget = Number(target);

    // Validate input
    if (isNaN(numericTarget)) {
      throw new Error("Invalid target value");
    }

    switch (type) {
      case "steps":
        return this.handleStepGoal(userId, numericTarget);
      case "water":
        return this.handleWaterGoal(userId, numericTarget);
      default:
        throw new Error("Invalid goal type");
    }
  }

  async handleStepGoal(userId, target) {
    if (target < MIN_STEPS) {
      throw new Error(`Minimum step goal is ${MIN_STEPS.toLocaleString()}`);
    }

    // Update user's step goal in User model
    return UserModel.updateStepGoal(userId, target);
  }

  async handleWaterGoal(userId, target) {
    if (target < MIN_WATER_ML) {
      throw new Error(`Minimum water goal is ${MIN_WATER_ML}ml`);
    }

    // Update water goal for current date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return WaterModel.upsertTarget(userId, today, target);
  }
}

module.exports = new GoalService();
