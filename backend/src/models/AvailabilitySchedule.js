const BaseModel = require("./BaseModel");

class AvailabilitySchedule extends BaseModel {
  constructor() {
    super("availabilitySchedule");
  }

  /**
   * Create availability slot with conflict check
   * @param {string} providerId
   * @param {Object} slot
   * @returns {Promise<Object>}
   */
  async createSlot(providerId, { startTime, endTime, recurrence }) {
    const conflict = await this.prisma.availabilitySchedule.findFirst({
      where: {
        providerId,
        OR: [
          { startTime: { lte: startTime }, endTime: { gte: startTime } },
          { startTime: { lte: endTime }, endTime: { gte: endTime } },
        ],
      },
    });

    if (conflict) throw new Error("Schedule conflict detected");

    return this.prisma.availabilitySchedule.create({
      data: {
        provider: { connect: { id: providerId } },
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        recurrence,
      },
    });
  }

  /**
   * Get available slots within date range
   * @param {string} providerId
   * @param {Date} start
   * @param {Date} end
   * @returns {Promise<Array>}
   */
  async getAvailableSlots(providerId, start, end) {
    return this.prisma.availabilitySchedule.findMany({
      where: {
        providerId,
        startTime: { gte: new Date(start) },
        endTime: { lte: new Date(end) },
      },
      orderBy: { startTime: "asc" },
    });
  }
}

module.exports = new AvailabilitySchedule();
