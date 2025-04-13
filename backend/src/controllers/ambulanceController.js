const AmbulanceService = require("../services/AmbulanceService");
const UserModel = require("../models/User");
const activeRequests = new Map(); // Track active requests and their intervals
const {
  sendRoleNotification,
  sendUserNotification,
} = require("../utils/sockets");
class AmbulanceController {
  /**
   * Create a new ambulance request and broadcast it to healthcare providers.
   */
  async createRequest(req, res) {
    try {
      // Check authorization first

      const userId = req.user.id;
      const { latitude, longitude, address, details } = req.body;

      // Create request in database
      const request = await AmbulanceService.createRequest({
        userId,
        latitude,
        longitude,
        address,
      });

      // Send notification via socket
      const io = req.app.get("socketio");
      await sendRoleNotification(io, "provider", {
        title: "New Ambulance Request",
        message: `Student ${req.user.name} needs an ambulance at ${address}`,
        type: "ambulance-request",
        data: {
          requestId: request.id || Date.now().toString(),
          studentId: req.user.id,
          studentName: req.user.name,
          location: address,
          details: details || "",
          timestamp: new Date(),
        },
      });

      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating ambulance request:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all ambulance requests for the logged-in user.
   */
  async getUserRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = await AmbulanceService.getUserRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user ambulance requests:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all ambulance requests (for healthcare providers).
   */
  async getallAmbulanceRequests(req, res) {
    try {
      const requests = await AmbulanceService.getallAmbulanceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching all ambulance requests:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Resolve an ambulance request and stop repeated notifications.
   */
  async resolveRequest(req, res, io) {
    try {
      const { id } = req.params;

      // Update the request status in the database
      const updatedRequest = await AmbulanceService.updateRequestStatus(
        id,
        "DISPATCHED"
      );

      // Stop the repeated notifications
      const intervalId = activeRequests.get(id);
      if (intervalId) {
        clearInterval(intervalId);
        activeRequests.delete(id);
      }

      res.status(200).json(updatedRequest);
    } catch (error) {
      console.error("Error resolving ambulance request:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AmbulanceController();
