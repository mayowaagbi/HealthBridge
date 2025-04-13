const express = require("express");
const AnalyticsController = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/appointments", AnalyticsController.getAppointmentAnalytics);
router.get("/health-trends", AnalyticsController.getHealthTrends);
router.get("/system-usage", AnalyticsController.getSystemUsage);

module.exports = router;
