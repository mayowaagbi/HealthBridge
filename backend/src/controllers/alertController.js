// src/controllers/AlertController.js
const AlertService = require("../services/AlertService");
const UserModel = require("../models/User");
const {
  sendRoleNotification,
  sendUserNotification,
} = require("../utils/sockets");
class AlertController {
  // constructor() {
  //   this.alertService = new AlertService();
  // }

  // src/controllers/AlertController.js
  async createAlert(req, res) {
    try {
      const { title, message, priority, duration, type, data } = req.body;
      console.log("Creating alert with data:", {
        title,
      });
      const io = req.app.get("socketio");

      if (!io) {
        throw new Error("Socket.IO instance not available");
      }
      // Validate required fields
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      // Check authorization
      if (req.user.role !== "ADMIN" && req.user.role !== "PROVIDER") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create role notifications",
        });
      }

      // Get all students
      const users = await UserModel.getAllStudents();
      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found",
        });
      }

      // Extract student IDs
      const studentDetailsIds = users
        .map((user) => user.profile?.studentDetails?.id)
        .filter((id) => id);

      if (studentDetailsIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No valid student IDs found",
        });
      }

      // Create alert in database
      const alert = await AlertService.createAlert({
        title,
        message,
        priority,
        duration,
        createdById: req.user.id,
        studentIds: studentDetailsIds,
      });
      console.log("Alert created:", alert);
      if (!alert) {
        return res.status(500).json({
          success: false,
          message: "Failed to create alert in database",
        });
      }

      // Send notification via socket
      // const io = req.app.get("socketio");
      const notificationType =
        type === "ambulance" ? "ambulance-request" : type || "info";

      // Send to all students
      await sendRoleNotification("STUDENT", {
        type: "alert",
        title: req.body.title,
        message: req.body.message,
        priority: req.body.priority || 3,
        expiresAt: new Date(Date.now() + req.body.duration * 60 * 60 * 1000),
      });

      // Log the broadcast
      console.log(`Broadcasting notification to role: student`);
      console.log(`Notification data:`, {
        title,
        message,
        type: notificationType,
        data: {
          ...data,
          timestamp: new Date(),
        },
      });

      // Return success response
      res.status(201).json({
        success: true,
        message: "Alert created and notification sent successfully",
        data: alert,
      });
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getallAlerts(req, res) {
    try {
      const alerts = await AlertService.getallAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAlert(req, res) {
    try {
      const id = req.params.id;
      console.log("Controller - Deleting alert with ID:", id); // Correctly extracts the ID from the request parameters
      await AlertService.deleteAlert(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async publishAlert(req, res) {
    try {
      const { id } = req.params;

      // Publish the alert
      const { updatedAlert, students } = await AlertService.publishAlert(id);

      // Broadcast the alert to all students via Socket.io
      const io = req.app.get("io");
      students.forEach((student) => {
        io.to(student.id).emit("alert-update", updatedAlert);
      });

      res.status(200).json(updatedAlert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateAlertStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedAlert = await AlertService.updateAlertStatus(id, status);
      res.status(200).json(updatedAlert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// module.exports = AlertController;
module.exports = new AlertController();
