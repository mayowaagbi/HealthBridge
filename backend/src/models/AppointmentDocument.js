const BaseModel = require("./BaseModel");

class AppointmentDocument extends BaseModel {
  constructor() {
    super("appointmentDocument");
  }

  /**
   * Upload document with metadata
   * @param {string} appointmentId
   * @param {Object} fileData
   * @returns {Promise<Object>}
   */
  async uploadDocument(appointmentId, { name, filePath, metadata }) {
    return this.prisma.appointmentDocument.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        name,
        filePath,
        metadata: metadata || {},
      },
    });
  }

  /**
   * Get documents with pagination
   * @param {string} appointmentId
   * @param {number} page
   * @param {number} pageSize
   * @returns {Promise<Object>}
   */
  async getDocuments(appointmentId, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    return this.prisma.appointmentDocument.findMany({
      where: { appointmentId },
      skip,
      take: pageSize,
      orderBy: { uploadedAt: "desc" },
    });
  }
}

module.exports = new AppointmentDocument();
