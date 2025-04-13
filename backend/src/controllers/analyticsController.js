const { AnalyticsService } = require("../services");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");

class AnalyticsController {
  getAppointmentAnalytics = asyncHandler(async (req, res) => {
    const stats = await AnalyticsService.getAppointmentStatistics();
    successResponse(res, stats);
  });

  getHealthTrends = asyncHandler(async (req, res) => {
    const trends = await AnalyticsService.getHealthTrends();
    successResponse(res, trends);
  });

  getSystemUsage = asyncHandler(async (req, res) => {
    const usageData = await AnalyticsService.getSystemUsageData();
    successResponse(res, usageData);
  });
}

module.exports = new AnalyticsController();
