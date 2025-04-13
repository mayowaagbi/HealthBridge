const { parseISO } = require("date-fns");
const HealthService = require("../services/dailyHealthService");
const StudentService = require("../services/StudentService");

class HealthController {
  async getDailyHealthData(req, res) {
    try {
      const userId = req.user.id;

      // Check if date query parameter exists
      if (!req.query.date) {
        return res.status(400).json({
          message: "Missing required query parameter: date",
        });
      }

      // Try to parse the date with error handling
      let date;
      try {
        date = parseISO(req.query.date);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            message: "Invalid date format. Please use ISO format (YYYY-MM-DD)",
          });
        }
      } catch (dateError) {
        return res.status(400).json({
          message: "Invalid date format. Please use ISO format (YYYY-MM-DD)",
        });
      }

      const healthData = await HealthService.getDailyHealthData(userId, date);

      res.json(healthData);
    } catch (error) {
      console.error("Error fetching daily health data:", error);
      res.status(500).json({
        message: "Error fetching health data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
  async getDailyHealthDataProvider(req, res) {
    try {
      // const userId = req.params.userId;
      const { studentId } = req.query; // Extract userId and date from query params
      const userId = await StudentService.findUserIdByStudentId(studentId);
      console.log("Fetching health data for userId:", userId);
      // Check if date query parameter exists
      if (!req.query.date) {
        return res.status(400).json({
          message: "Missing required query parameter: date",
        });
      }

      // Try to parse the date with error handling
      let date;
      try {
        date = parseISO(req.query.date);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          return res.status(400).json({
            message: "Invalid date format. Please use ISO format (YYYY-MM-DD)",
          });
        }
      } catch (dateError) {
        return res.status(400).json({
          message: "Invalid date format. Please use ISO format (YYYY-MM-DD)",
        });
      }

      const healthData = await HealthService.getDailyHealthData(userId, date);

      res.json(healthData);
    } catch (error) {
      console.error("Error fetching daily health data:", error);
      res.status(500).json({
        message: "Error fetching health data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
  // Add a method to get weekly health data
  async getWeeklyHealthData(req, res) {
    try {
      const userId = req.user.id;

      // Optional date parameter - defaults to current date if not provided
      let startDate;
      if (req.query.startDate) {
        try {
          startDate = parseISO(req.query.startDate);
          if (isNaN(startDate.getTime())) {
            return res.status(400).json({
              message:
                "Invalid startDate format. Please use ISO format (YYYY-MM-DD)",
            });
          }
        } catch (dateError) {
          return res.status(400).json({
            message:
              "Invalid startDate format. Please use ISO format (YYYY-MM-DD)",
          });
        }
      }

      const healthData = await HealthService.getWeeklyHealthData(
        userId,
        startDate
      );

      res.json(healthData);
    } catch (error) {
      console.error("Error fetching weekly health data:", error);
      res.status(500).json({
        message: "Error fetching weekly health data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = new HealthController();
