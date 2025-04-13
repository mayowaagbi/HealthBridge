/**
 * Central error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log to console for dev
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
