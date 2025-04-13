// models/MedicalDocumentModel.js
const BaseModel = require("./BaseModel");
const StudentDetails = require("./StudentDetails");
class MedicalDocumentModel extends BaseModel {
  constructor() {
    super("medicalDocument");
  }

  // async createDocument(studentId, fileData) {
  //   // Changed parameters
  //   try {
  //     console.log("Creating document entry for student:", studentId);
  //     return await this.prisma.medicalDocument.create({
  //       // Fixed prisma reference
  //       data: {
  //         studentId, // Match schema field name
  //         filename: fileData.originalname,
  //         path: fileData.path,
  //         mimetype: fileData.mimetype,
  //         size: fileData.size,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Create document error:", error);
  //     throw new Error("Failed to create document entry");
  //   }
  // }
  async create(data) {
    try {
      console.log("Creating DB entry:", data);

      // Get the userId associated with the studentId
      const userId = await StudentDetails.getUserIdByStudentId(data.studentId);

      // Create the MedicalDocument
      const result = await this.prisma.medicalDocument.create({
        data: {
          filename: data.filename,
          path: data.path,
          mimetype: data.mimetype,
          size: data.size,
          student: {
            connect: { id: data.studentId }, // Connect to existing StudentDetails
          },
          uploadedBy: {
            connect: { id: userId }, // Connect to existing User using the retrieved userId
          },
        },
        include: {
          student: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          uploadedBy: {
            select: {
              email: true, // Include uploadedBy user's email for reference
            },
          },
        },
      });

      console.log("Created document ID:", result.id);
      return result;
    } catch (error) {
      console.error("Model create error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }
  async findMany(query) {
    try {
      return await this.prisma.medicalDocument.findMany(query);
    } catch (error) {
      console.error("FindMany error:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.prisma.medicalDocument.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("FindById error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.prisma.medicalDocument.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  }
  // async recentUploads(providerId) {
  //   const sevenDaysAgo = new Date();
  //   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //   return this.prisma.medicalDocument.count({
  //     where: {
  //       student: { primaryCareProviderId: providerId },
  //       uploadedAt: { gte: sevenDaysAgo },
  //     },
  //   });
  // }
  async getRecentUploads() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of the next day

      const uploads = await this.prisma.medicalDocument.count({
        where: {
          uploadedAt: {
            gte: today, // Greater than or equal to today
            lt: tomorrow, // Less than tomorrow
          },
        },
      });

      return uploads;
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
      throw new Error("Failed to fetch recent uploads");
    }
  }

  async getAllHealthRecords() {
    try {
      return await this.prisma.medicalDocument.findMany({
        include: {
          student: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          // uploadedBy: {
          //   include: {
          //     profile: {
          //       select: {
          //         firstName: true,
          //         lastName: true,
          //       },
          //     },
          //   },
          // },
        },
      });
    } catch (error) {
      console.error("Failed to fetch health records:", error);
    }
  }
}

module.exports = new MedicalDocumentModel();
