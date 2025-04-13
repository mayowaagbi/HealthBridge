// src/services/AlertService.js
const AlertModel = require("../models/AlertModel");

class AlertService {
  // constructor() {
  //   AlertModel = new AlertModel();
  // }

  async createAlert(data) {
    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + data.duration * 60 * 60 * 1000
    );

    return AlertModel.createWithStudents({
      ...data,
      startTime,
      endTime,
    });
  }

  async getallAlerts() {
    return AlertModel.findMany({
      include: {
        students: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }
  async getActiveAlerts() {
    return await AlertModel.getActiveAlerts();
  }
  async countActiveAlerts() {
    return await AlertModel.countActiveAlerts();
  }
  async deleteAlert(id) {
    console.log("Service - Deleting alert with ID:", id);
    return AlertModel.deleteAlert(id); // Problem: Wraps the ID in an object
  }

  async publishAlert(id) {
    // Check if the alert exists
    const alert = await AlertModel.findById(id);
    if (!alert) {
      throw new Error("Alert not found");
    }

    // Update the alert status to ACTIVE
    const updatedAlert = await AlertModel.updateAlertStatus(id, "ACTIVE");

    // Fetch all students
    const students = await AlertModel.getAllStudents();

    return { updatedAlert, students };
  }

  async updateAlertStatus(id, status) {
    return AlertModel.updateAlertStatus(id, status);
  }
}

// module.exports = AlertService;
module.exports = new AlertService();
