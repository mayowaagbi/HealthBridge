const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "../uploads/medical-documents/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Upload directory created at: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Saving file to directory: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 60); // limit filename length

    const extension = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${uuidv4().substring(0, 8)}`;

    const finalFilename = `${originalName}-${uniqueSuffix}${extension}`;
    console.log(`Generated filename: ${finalFilename}`);
    cb(null, finalFilename);
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  console.log(`Received file with mimetype: ${file.mimetype}`);

  if (allowedTypes.includes(file.mimetype)) {
    console.log(`File type allowed: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.error(`Invalid file type: ${file.mimetype}`);
    cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
  }
};

// Create multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Allow only one file per request
  },
});

// Create middleware handler with error handling
const handleUpload = (fieldName) => {
  return (req, res, next) => {
    console.log(`Starting file upload for field: ${fieldName}`);
    console.log(`Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`Request body: ${JSON.stringify(req.body)}`);

    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err.message);
        console.error("Error details:", {
          code: err.code,
          stack: err.stack,
          file: req.file,
        });

        if (err.code === "LIMIT_FILE_SIZE") {
          console.error("File size limit exceeded");
          return res.status(400).json({
            error: "File size exceeds the 10MB limit",
          });
        }

        if (err.message.includes("Invalid file type")) {
          console.error("Invalid file type uploaded");
          return res.status(400).json({
            error: err.message,
          });
        }

        // Handle other multer errors
        console.error("Unknown multer error:", err);
        return res.status(400).json({
          error: "File upload failed. Please try again.",
        });
      }

      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      console.log("File uploaded successfully:", req.file);
      next();
    });
  };
};

module.exports = { handleUpload };
