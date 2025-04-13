const UserService = require("../services/UserService");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middleware");
class UserController {
  static getProfile = async (req, res) => {
    try {
      const user = await UserService.getUserById(req.user.id);
      successResponse(res, user);
    } catch (error) {
      errorResponse(res, error);
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const updatedUser = await UserService.updateUser(req.user.id, req.body);
      successResponse(res, updatedUser);
    } catch (error) {
      errorResponse(res, error);
    }
  };

  static deleteAccount = async (req, res) => {
    try {
      await UserService.deleteUser(req.user.id);
      successResponse(res, { message: "Account deleted successfully" });
    } catch (error) {
      errorResponse(res, error);
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      successResponse(res, users);
    } catch (error) {
      errorResponse(res, error);
    }
  };

  static updateUserStatus = async (req, res) => {
    try {
      const updatedUser = await UserService.updateUserStatus(
        req.params.id,
        req.body.status
      );
      successResponse(res, updatedUser);
    } catch (error) {
      errorResponse(res, error);
    }
  };
}

module.exports = UserController;
