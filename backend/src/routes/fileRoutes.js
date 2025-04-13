const express = require("express");
const FileController = require("../controllers/fileController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/upload", FileController.uploadFile);
router.delete("/:id", FileController.deleteFile);

module.exports = router;
