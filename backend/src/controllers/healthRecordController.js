const { HealthRecordService } = require("../services");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middleware/validationMiddleware");
const { createHealthRecordSchema } = require("../validations/healthValidation");

class HealthRecordController {
  createRecord = asyncHandler(async (req, res) => {
    const recordData = req.body;
    const record = await HealthRecordService.createRecord(recordData);
    successResponse(res, record, 201);
  });

  uploadDocument = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const file = req.file;
    const document = await HealthRecordService.uploadDocument(recordId, file);
    successResponse(res, document, 201);
  });

  getRecords = asyncHandler(async (req, res) => {
    const records = await HealthRecordService.getRecords();
    successResponse(res, records);
  });
}

module.exports = new HealthRecordController();
