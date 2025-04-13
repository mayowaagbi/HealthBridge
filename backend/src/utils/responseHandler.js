const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error.stack : {},
  });
};

module.exports = { successResponse, errorResponse };
