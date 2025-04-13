const express = require("express");
const geoController = require("../controllers/geoController");
const rateLimiter = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate);
router.post("/track", rateLimiter, geoController.processLocation);
router.get("/progress", geoController.getProgress);
router.post("/reset", geoController.resetStepCount);

module.exports = router;
