const express = require("express");
const HealthRecordController = require("../controllers/healthRecordController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");
const {
  createHealthRecordSchema,
} = require("../validations/healthRecordValidation");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  validateRequest(createHealthRecordSchema),
  HealthRecordController.createRecord
);
router.get("/", HealthRecordController.getRecords);
router.post(
  "/:recordId/documents",
  upload.single("file"),
  HealthRecordController.uploadDocument
);

module.exports = router;
