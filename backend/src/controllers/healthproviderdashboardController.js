const StudentService = require("../services/studentService");
const documentService = require("../services/documentService");
const AlertService = require("../services/AlertService");
const AppointmentService = require("../services/AppointmentService");
class DashboardController {
  async getStats(req, res) {
    try {
      console.log("Request User ID:", req.user?.id); // Debugging

      const providerId = req.user.id;
      if (!StudentService || !StudentService.countByProvider) {
        throw new Error("StudentService is not defined or incorrect.");
      }

      const [totalStudents, todaysAppointments, recentUploads, activeAlerts] =
        await Promise.all([
          StudentService.countStudents(),
          AppointmentService.countToday(providerId),
          documentService.recentUploads(providerId),
          AlertService.countActiveAlerts(),
        ]);

      res.json({
        totalStudents,
        todaysAppointments,
        recentUploads,
        activeAlerts,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch dashboard stats" });
    }
  }

  async getAppointmentOverview(req, res) {
    try {
      const providerId = req.user.id;
      const overview = await AppointmentService.weeklyOverview(providerId);
      res.json(overview);
    } catch (error) {
      console.error("Appointment overview error:", error);
      res.status(500).json({ error: "Failed to fetch appointment overview" });
    }
  }
}

module.exports = new DashboardController();
