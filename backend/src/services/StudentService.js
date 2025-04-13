const StudentDetailsModel = require("../models/StudentDetails");
const user = require("../models/User");
class StudentService {
  /**
   * Find student by user ID
   */
  async findStudentByUserId(userId) {
    console.log("[StudentService] Searching for student with userId:", userId);

    try {
      // Find the profile associated with the user
      const profile = await StudentDetailsModel.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) throw new Error("Profile not found");

      // Find the student associated with the profile
      const student =
        await StudentDetailsModel.prisma.studentDetails.findUnique({
          where: { profileId: profile.id },
        });

      if (!student)
        throw new Error(`No student found for profileId: ${profile.id}`);

      return student;
    } catch (error) {
      console.error("StudentService Error:", error);
      throw new Error("Failed to find student");
    }
  }
  /**
   * Find userId by studentId
   */
  async findUserIdByStudentId(studentId) {
    console.log(
      "[StudentService] Searching for userId with studentId:",
      studentId
    );

    try {
      // Use the model's method to get the userId
      const userId = await StudentDetailsModel.getUserIdByStudentId(studentId);
      return userId;
    } catch (error) {
      console.error("StudentService Error:", error);
      throw new Error("Failed to find userId");
    }
  }

  /**
   * Get list of students (calls model method)
   */
  async getStudentsService(search, status) {
    try {
      return await StudentDetailsModel.getStudentsFromDB(search, status);
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new Error("Internal server error");
    }
  }

  /**
   * Count students by provider
   */
  async countByProvider(providerId) {
    return StudentDetailsModel.countByProvider(providerId);
  }
  async countStudents() {
    return user.countStudents();
  }
}

module.exports = new StudentService();
