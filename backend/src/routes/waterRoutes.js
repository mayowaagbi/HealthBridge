const express = require("express");
const router = express.Router();
const WaterController = require("../controllers/waterController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

// Add this endpoint
router.get("/", WaterController.getProgress); // GET /api/water

router.post("/goal", WaterController.setGoal);
router.post("/intake", WaterController.addIntake);
router.get("/progress", WaterController.getProgress); // GET /api/water/progress

module.exports = router;
