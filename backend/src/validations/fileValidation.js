const validateFileUpload = (req, res, next) => {
  if (!req.files) return next();

  const file = req.files.file;
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(",");

  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: "Invalid file type" });
  }

  if (file.size > process.env.MAX_FILE_SIZE) {
    return res.status(400).json({ error: "File too large" });
  }

  next();
};
module.exports = { validateFileUpload };
