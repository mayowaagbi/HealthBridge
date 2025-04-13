const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { authenticate } = require("../middleware/authMiddleware");

// Log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Apply authentication to all routes
router.use(authenticate);

// Get all documents for the authenticated user
router.get("/", documentController.getDocuments);

// Upload a new document
router.post("/upload", documentController.uploadDocument);

// Download a specific document
router.get("/download/:id", documentController.downloadDocument);
router.get("/all", documentController.getAllDocuments);

// Delete a document
router.delete("/:id", documentController.deleteDocument);

// Log errors
router.use((err, req, res, next) => {
  console.error("Error in document routes:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
