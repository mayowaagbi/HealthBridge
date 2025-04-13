const express = require("express");
const DashboardController = require("../controllers/healthproviderdashboardController");
const {
  authenticate,
  authorizeProvider,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, authorizeProvider);

router.get("/stats", DashboardController.getStats);
router.get("/overview", DashboardController.getAppointmentOverview);

module.exports = router;
