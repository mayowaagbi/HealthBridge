const { EmergencyService } = require("../services");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");

class EmergencyController {
  triggerEmergency = asyncHandler(async (req, res) => {
    const result = await EmergencyService.triggerEmergencyAlert(
      req.user.id,
      req.body.location
    );
    successResponse(res, result);
  });

  getEmergencyContacts = asyncHandler(async (req, res) => {
    const contacts = await EmergencyService.getEmergencyContacts(req.user.id);
    successResponse(res, contacts);
  });

  addEmergencyContact = asyncHandler(async (req, res) => {
    const contact = await EmergencyService.addEmergencyContact(
      req.user.id,
      req.body
    );
    successResponse(res, contact, 201);
  });

  deleteEmergencyContact = asyncHandler(async (req, res) => {
    await EmergencyService.deleteEmergencyContact(
      req.user.id,
      req.params.contactId
    );
    successResponse(res, { message: "Emergency contact deleted successfully" });
  });
}

module.exports = new EmergencyController();
