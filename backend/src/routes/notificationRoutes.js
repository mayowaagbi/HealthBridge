// const express = require("express");
// const NotificationController = require("../controllers/notificationController");
// const { authenticate, authorize } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.use(authenticate);

// router.get("/", NotificationController.getNotifications);
// router.patch("/mark-read", NotificationController.markAsRead);

// // Admin-only notification broadcast
// router.post(
//   "/broadcast",
//   authorize("ADMIN"),
//   NotificationController.sendNotification
// );

// module.exports = router;
// src/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const { authorize, authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

// Provider routes
router.post(
  "/",
  authorize("PROVIDER"),
  NotificationController.createNotification
);

// User routes
router.get(
  "/",
  authorize("STUDENT", "PROVIDER"),
  NotificationController.getallNotifications
);
router.patch(
  "/:id/read",
  authorize("STUDENT"),
  NotificationController.markAsRead
);
router.delete(
  "/:id",
  authorize("PROVIDER"),
  NotificationController.deleteNotification
);

module.exports = router;
