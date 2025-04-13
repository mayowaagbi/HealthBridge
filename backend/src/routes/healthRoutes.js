// routes/healthRoutes.js
const express = require("express");
const router = express.Router();
const HealthController = require("../controllers/HealthController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/weekly", authenticate, HealthController.getWeeklyHealthData);
console.log("Registered /api/healthdata/weekly route"); // Route registration log

module.exports = router;
