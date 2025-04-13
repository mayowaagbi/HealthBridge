const express = require("express");
const SupportController = require("../controllers/supportController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all support staff
router.get("/", SupportController.getAllSupports);

// Get support staff by ID
router.get("/:id", SupportController.getSupportById);

// Create a new support staff (only for admins)
router.post("/", authorize("ADMIN"), SupportController.createSupport);

// Update support staff (only for admins)
router.patch("/:id", authorize("ADMIN"), SupportController.updateSupport);

// Delete support staff (only for admins)
router.delete("/:id", authorize("ADMIN"), SupportController.deleteSupport);

module.exports = router;
