const SupportService = require("../services/SupportService");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");

class SupportController {
  // Get all support staff
  getAllSupports = asyncHandler(async (req, res) => {
    try {
      const supports = await SupportService.getAllSupports();
      successResponse(res, supports);
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });

  // Get support staff by ID
  getSupportById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const support = await SupportService.getSupportById(id);
      successResponse(res, support);
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });

  // Create a new support staff
  createSupport = asyncHandler(async (req, res) => {
    try {
      const supportData = req.body;
      const newSupport = await SupportService.createSupport(supportData);
      successResponse(res, newSupport, 201);
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });

  // Update support staff
  updateSupport = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedSupport = await SupportService.updateSupport(id, updateData);
      successResponse(res, updatedSupport);
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });

  // Delete support staff
  deleteSupport = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      await SupportService.deleteSupport(id);
      successResponse(res, { message: "Support staff deleted successfully" });
    } catch (error) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  });
  async checkAvailability(
    supportId,
    startTime,
    duration,
    excludeAppointmentId = null
  ) {
    const conflictingAppointments = await supportModel.checkAvailability(
      supportId,
      startTime,
      duration,
      excludeAppointmentId
    );
    return conflictingAppointments.length === 0;
  }
}

module.exports = new SupportController();
