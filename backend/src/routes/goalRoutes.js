// routes/goalRoutes.js
const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

// PUT /api/goals/:type
router.put("/:type", goalController.updateGoal);

module.exports = router;
