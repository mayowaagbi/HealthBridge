const { FileService } = require("../services");
const asyncHandler = require("../utils/asyncHandler");
const path = require("path");
const fs = require("fs");

class FileController {
  uploadFile = asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filename = `${req.user.id}-${Date.now()}${path.extname(file.name)}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await file.mv(path.join(uploadDir, filename));

    const savedFile = await FileService.createFile({
      userId: req.user.id,
      url: `/uploads/${filename}`,
      type: req.body.type || "OTHER",
      description: req.body.description,
    });

    res.json(savedFile);
  });

  deleteFile = asyncHandler(async (req, res) => {
    await FileService.deleteFile(req.params.id);
    res.json({ success: true });
  });
}

module.exports = new FileController();
