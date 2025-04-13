const AmbulanceModel = require("../models/AmbulanceModel");
const { reverseGeocode } = require("../utils/geocoding"); // Optional geocoding service

class AmbulanceService {
  /**
   * Create a new ambulance request.
   */
  static async createRequest({ userId, latitude, longitude, address }) {
    try {
      // Optional: Get human-readable address from coordinates
      const locationAddress =
        address || (await reverseGeocode(latitude, longitude));

      return AmbulanceModel.createRequest({
        userId,
        latitude,
        longitude,
        address: locationAddress,
      });
    } catch (error) {
      throw new Error(`Failed to create ambulance request: ${error.message}`);
    }
  }

  /**
   * Get all ambulance requests for a specific user.
   */
  static async getUserRequests(userId) {
    try {
      return AmbulanceModel.getRequestsByUser(userId);
    } catch (error) {
      throw new Error(`Failed to fetch user requests: ${error.message}`);
    }
  }

  /**
   * Get all ambulance requests.
   */
  static async getallAmbulanceRequests() {
    try {
      return AmbulanceModel.findMany({
        include: {
          user: {
            include: {
              profile: true, // Include the user's profile data
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch all requests: ${error.message}`);
    }
  }

  /**
   * Update the status of an ambulance request.
   */
  static async updateRequestStatus(requestId, status) {
    try {
      return AmbulanceModel.updateStatus(requestId, status);
    } catch (error) {
      throw new Error(`Failed to update request status: ${error.message}`);
    }
  }
}

module.exports = AmbulanceService;
