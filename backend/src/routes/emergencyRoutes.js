const express = require("express");
const EmergencyController = require("../controllers/emergencyController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/trigger", EmergencyController.triggerEmergency);
router.get("/contacts", EmergencyController.getEmergencyContacts);
router.post("/contacts", EmergencyController.addEmergencyContact);
router.delete(
  "/contacts/:contactId",
  EmergencyController.deleteEmergencyContact
);

module.exports = router;
