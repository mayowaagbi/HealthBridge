class ResponseError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ResponseError";
    Error.captureStackTrace(this, this.constructor);
  }
}

const validateResponseObject = (res) => {
  if (
    !res ||
    typeof res.status !== "function" ||
    typeof res.json !== "function"
  ) {
    console.error("Invalid response object provided:", res);
    throw new ResponseError("Internal Server Error", 500, {
      internal: "Invalid Express response object",
    });
  }
};

const sendResponse = (res, payload, statusCode = 200) => {
  try {
    validateResponseObject(res);

    const response = {
      success: statusCode < 400,
      timestamp: new Date().toISOString(),
    };

    if (statusCode < 400) {
      response.data = payload;
    } else {
      response.error = {
        message: payload.message || "An error occurred",
        code: payload.code || statusCode,
        ...(process.env.NODE_ENV === "development" && {
          stack: payload.stack,
          details: payload.details,
        }),
      };
    }

    return res.status(statusCode).json(response);
  } catch (error) {
    console.error("Critical response handling error:", error);
    // Last resort fallback
    if (res && typeof res.status === "function") {
      return res.status(500).json({
        success: false,
        error: {
          message: "Internal Server Error",
        },
      });
    }
    // If we can't even send a response
    console.error("Fatal: Unable to send error response");
    process.exit(1);
  }
};

const successResponse = (res, data, statusCode = 200) => {
  return sendResponse(res, data, statusCode);
};

const errorResponse = (res, error, statusCode) => {
  const normalizedError =
    error instanceof ResponseError
      ? error
      : new ResponseError(
          error.message,
          statusCode || error.statusCode || 500,
          error.details || {}
        );

  return sendResponse(res, normalizedError, normalizedError.statusCode);
};

module.exports = {
  ResponseError,
  successResponse,
  errorResponse,
};
