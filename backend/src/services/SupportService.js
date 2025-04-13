const SupportModel = require("../models/SupportModel");
const { ApiError } = require("../utils/apiError");

class SupportService {
  async getAllSupports() {
    try {
      return await SupportModel.getAllSupports();
    } catch (error) {
      throw new ApiError(500, "Failed to fetch support staff");
    }
  }

  async getSupportById(id) {
    try {
      const support = await SupportModel.getSupportById(id);
      if (!support) {
        throw new ApiError(404, "Support staff not found");
      }
      return support;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch support staff");
    }
  }

  async createSupport(supportData) {
    try {
      return await SupportModel.createSupport(supportData);
    } catch (error) {
      throw new ApiError(500, "Failed to create support staff");
    }
  }

  async updateSupport(id, updateData) {
    try {
      return await SupportModel.updateSupport(id, updateData);
    } catch (error) {
      throw new ApiError(500, "Failed to update support staff");
    }
  }

  async deleteSupport(id) {
    try {
      await SupportModel.deleteSupport(id);
    } catch (error) {
      throw new ApiError(500, "Failed to delete support staff");
    }
  }
  async checkAvailability(
    supportId,
    startTime,
    duration,
    excludeAppointmentId = null
  ) {
    console.log("Checking availability for support:", supportId);
    console.log("Start time:", startTime);
    console.log("Duration:", duration);
    console.log("Exclude appointment ID:", excludeAppointmentId);
    const isAvailable = await SupportModel.checkAvailability(
      supportId,
      startTime,
      duration,
      excludeAppointmentId
    );
    return isAvailable;
  }
}

module.exports = new SupportService();
