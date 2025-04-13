const notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
    path: req.originalUrl,
  });
};

module.exports = notFound;
