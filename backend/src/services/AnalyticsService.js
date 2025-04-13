const { Appointment, HealthRecord } = require("../models/Appointment");
class AnalyticsService {
  async getAppointmentStats(period) {
    return Appointment.aggregate([
      { $match: { createdAt: { $gte: period.start } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          averageDuration: { $avg: "$duration" },
        },
      },
    ]);
  }

  async getHealthTrends() {
    return HealthRecord.aggregate([
      {
        $group: {
          _id: "$diagnosis",
          count: { $sum: 1 },
          latest: { $max: "$recordedAt" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }
}

module.export = new AnalyticsService();
