const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");
const { updateProfileSchema } = require("../validations/userValidation");
const UserController = require("../controllers/userController");

const router = express.Router();

router.use(authenticate);

router.get("/me", UserController.getProfile);
router.put(
  "/profile",
  validateRequest(updateProfileSchema),
  UserController.updateProfile
);
router.delete("/", UserController.deleteAccount);

// Admin-only routes
router.get("/", authorize("ADMIN"), UserController.getAllUsers);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  UserController.updateUserStatus
);

module.exports = router;
