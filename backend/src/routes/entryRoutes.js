const express = require("express");
const router = express.Router();
const EntryController = require("../controllers/entryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Use the authenticate middleware (and optionally, authorize if needed)
router.post("/entries", authenticate, EntryController.createEntry);
router.get("/entries", authenticate, EntryController.getEntries);

module.exports = router;
