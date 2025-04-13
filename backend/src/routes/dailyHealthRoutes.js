// File: src/routes/healthRoutes.ts
const express = require("express");
const HealthController = require("../controllers/dailyHealthController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate);

router.get("/daily", HealthController.getDailyHealthData);

router.get(
  "/daily/provider",
  authorize("PROVIDER"),
  (req, res, next) => {
    console.log("Received GET request with query:", req.query);
    next();
  },
  HealthController.getDailyHealthDataProvider
);
module.exports = router;
