// src/models/AlertModel.js
const BaseModel = require("./BaseModel");

class AlertModel extends BaseModel {
  constructor() {
    super("alert");
  }

  async createWithStudents(data) {
    return this.prisma.alert.create({
      data: {
        title: data.title,
        message: data.message,
        priority: data.priority,
        startTime: data.startTime,
        endTime: data.endTime,
        createdById: data.createdById,
        students: {
          create: data.studentIds.map((studentDetailsId) => ({
            student: {
              connect: { id: studentDetailsId },
            },
          })),
        },
      },
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
  async findById(id) {
    return prisma.alert.findUnique({ where: { id } });
  }
  async findMany(options) {
    return this.prisma.alert.findMany(options);
  }
  async updateAlertStatus(id, status) {
    return prisma.alert.update({
      where: { id },
      data: { status },
    });
  }
  async getActiveAlerts() {
    return await this.prisma.alert.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  }
  async countActiveAlerts() {
    return await this.prisma.alert.count({
      where: { status: "ACTIVE" },
    });
  }
  async deleteAlert(id) {
    try {
      console.log("Model - Deleting alert with ID:", id);
      // Step 1: Delete related AlertStudent records
      await this.prisma.alertStudent.deleteMany({
        where: {
          alertId: id, // Use the ID directly (no nested "id" property)
        },
      });

      // Step 2: Delete the Alert record
      await this.prisma.alert.delete({
        where: { id: id }, // Correct usage: pass the id directly
      });

      console.log(
        "Alert and related AlertStudent records deleted successfully:",
        id
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw new Error("Failed to delete alert");
    }
  }
  async updateAlertStatus(id, status) {
    return prisma.alert.update({
      where: { id },
      data: { status },
    });
  }
}

module.exports = new AlertModel();
