const BaseModel = require("./BaseModel");

class AppointmentHistory extends BaseModel {
  constructor() {
    super("appointmentHistory");
  }

  /**
   * Log appointment state change
   * @param {string} appointmentId
   * @param {string} userId
   * @param {string} status
   * @returns {Promise<Object>}
   */
  async logChange(appointmentId, userId, status) {
    return this.prisma.appointmentHistory.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        changedBy: { connect: { id: userId } },
        status,
      },
      include: { changedBy: true },
    });
  }

  /**
   * Get audit trail for appointment
   * @param {string} appointmentId
   * @returns {Promise<Array>}
   */
  async getAuditTrail(appointmentId) {
    return this.prisma.appointmentHistory.findMany({
      where: { appointmentId },
      include: { changedBy: { select: { email: true, role: true } } },
      orderBy: { timestamp: "desc" },
    });
  }
}

module.exports = new AppointmentHistory();
