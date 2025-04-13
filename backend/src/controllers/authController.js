const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/AuthService");

class AuthController {
  // Register a new user
  static register = asyncHandler(async (req, res) => {
    try {
      const userData = await AuthService.registerUser(req.body);
      successResponse(res, userData, 201);
    } catch (error) {
      console.error("Registration Error:", error); // Log the full error for debugging

      const statusCode = error.statusCode || 500;
      const message =
        error.message || "An unexpected error occurred during registration.";

      errorResponse(
        res,
        {
          success: false,
          message,
          ...(process.env.NODE_ENV === "development" && { stack: error.stack }), // Show stack trace in development mode only
        },
        statusCode
      );
    }
  });

  // User login
  static login = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.login(email, password, res);
      successResponse(res, { user, tokens });
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 401);
    }
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      successResponse(res, { tokens });
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 401);
    }
  });

  // Logout user
  static logout = asyncHandler(async (req, res) => {
    try {
      await AuthService.logout(req.user.id);
      successResponse(res, { message: "Successfully logged out" });
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });
}

module.exports = { AuthController };
