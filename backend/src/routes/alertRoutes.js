// src/routes/alertRoutes.ts
const express = require("express");
const alertController = require("../controllers/alertController");
const { authorize, authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate);

// Create   a new alert
router.post(
  "/",
  authorize("PROVIDER"),
  (req, res, next) => {
    console.log("POST /api/alert/", {
      // id: req.params.id,
      body: req.body,
    });
    next();
  },
  alertController.createAlert
);
// router.post("/", authorize("STUDENT"), AppointmentController.createAppointment);

// Get all alerts
router.get("/", authorize("PROVIDER"), alertController.getallAlerts);

// Delete an alert
router.delete(
  "/:id",
  authorize("PROVIDER"),
  (req, res, next) => {
    console.log("DELETE /api/alert/", {
      id: req.params.id,
      body: req.body,
    });
    next();
  },
  alertController.deleteAlert
);

router.patch(
  "/:id/publish",
  authorize("PROVIDER"),
  alertController.publishAlert
);

// Update alert status
router.patch("/:id", authorize("PROVIDER"), alertController.updateAlertStatus);

module.exports = router;
