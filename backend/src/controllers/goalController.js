const goalService = require("../services/goalService");

class GoalController {
  async updateGoal(req, res) {
    console.log(`Received ${req.method} request to ${req.originalUrl}`);

    try {
      const { type } = req.params;
      console.log("Goal type:", type);

      const { target } = req.body;
      console.log("Target value:", target);

      const userId = req.user.id;
      console.log("Authenticated user ID:", userId);

      if (!["steps", "water"].includes(type)) {
        console.error("Invalid goal type:", type);
        return res.status(400).json({ error: "Invalid goal type" });
      }

      const updatedGoal = await goalService.updateGoal(userId, type, target);
      console.log("Update successful:", updatedGoal);

      res.json(updatedGoal);
    } catch (error) {
      console.error("Error in updateGoal:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GoalController();
