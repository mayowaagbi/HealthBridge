const StudentService = require("../services/studentService");
const ProviderService = require("../services/ProviderService");
const StudentController = {
  /**
   * Get list of students
   */
  async getStudents(req, res) {
    try {
      const { search, status } = req.query;
      const students = await StudentService.getStudentsService(search, status);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get a student by user ID
   */
  async getStudentByUserId(req, res) {
    try {
      const { userId } = req.params;
      const student = await StudentService.findStudentByUserId(userId);
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  async getProviderByUserId(req, res) {
    try {
      const { userId } = req.params;
      const provider = await ProviderService.findProviderByUserId(userId);
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = StudentController;
// module.exports = new StudentController();
