const express = require("express");
const AppointmentController = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");
const {
  createAppointmentSchema,
} = require("../validations/appointmentValidation");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new appointment (only for students)
router.post("/", authorize("STUDENT"), AppointmentController.createAppointment);

router.get(
  "/",
  authenticate,
  authorize("STUDENT"),
  AppointmentController.getAppointments
);
// Fetch appointment details (only for students)
router.get(
  "/",
  authorize("STUDENT"), // Ensure only students can fetch their appointment details
  AppointmentController.getAppointmentDetails
);

// Cancel an appointment (only for students)
router.delete(
  "/:id/cancel",
  authorize("STUDENT"), // Ensure only students can cancel their appointments
  AppointmentController.deleteAppointment
);

router.patch(
  "/:id/reschedule",
  (req, res, next) => {
    console.log("PATCH /api/appointments/:id/status", {
      id: req.params.id,
      body: req.body,
    });
    next();
  },
  authorize("STUDENT"),
  // validateRequest(rescheduleAppointmentSchema),
  AppointmentController.rescheduleAppointment
);
router.get(
  "/provider",
  authorize("PROVIDER"),
  AppointmentController.getProviderAppointments
);
router.patch(
  "/:id/status",
  authorize("PROVIDER"),
  AppointmentController.updateAppointmentStatus
);

// router.patch(
//   "/:id/assign-support",
//   authorize("PROVIDER"),
//   AppointmentController.assignSupport
// );
router.patch(
  "/:id/assign-support",
  (req, res, next) => {
    console.log("Received PATCH request:", req.params, req.body);
    next();
  },
  authorize("ADMIN", "PROVIDER"),
  AppointmentController.assignSupport
);
router.patch("/:id/location", AppointmentController.updateAppointmentLocation);
// Fetch ALL appointments (no provider-specific filtering)
router.get(
  "/all",
  authenticate, // Ensure the user is authenticated
  authorize("ADMIN", "PROVIDER"), // Only admins or providers can access
  AppointmentController.getAllAppointments
);
router.get(
  "/:id/history",
  authenticate,
  authorize("PROVIDER", "ADMIN"),
  AppointmentController.getAppointmentHistory
);
router.get(
  "/student",
  authenticate,
  authorize("STUDENT"),
  AppointmentController.getStudentAppointments
);
module.exports = router;
