const BaseModel = require("./BaseModel");
const { Prisma } = require("@prisma/client");

class SupportModel extends BaseModel {
  constructor() {
    super("supportDetails");
  }

  async getAllSupports() {
    return this.prisma.supportDetails.findMany({
      include: { profile: true },
    });
  }

  async getSupportById(id) {
    return this.prisma.supportDetails.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createSupport(supportData) {
    return this.prisma.supportDetails.create({
      data: supportData,
      include: { profile: true },
    });
  }

  async updateSupport(id, updateData) {
    return this.prisma.supportDetails.update({
      where: { id },
      data: updateData,
      include: { profile: true },
    });
  }

  async deleteSupport(id) {
    return this.prisma.supportDetails.delete({
      where: { id },
    });
  }

  // async checkAvailability(
  //   supportId,
  //   startTime,
  //   duration,
  //   excludeAppointmentId = null
  // ) {
  //   console.log("Checking availability for support:", supportId);
  //   console.log("Start time:", startTime);
  //   console.log("Duration:", duration);
  //   console.log("Exclude appointment ID:", excludeAppointmentId);

  //   const start = new Date(startTime);
  //   const end = new Date(start.getTime() + duration * 60000); // Convert duration to milliseconds

  //   console.log("Time range:", start, "to", end);

  //   try {
  //     let query = Prisma.sql`
  //     SELECT * FROM "Appointment"
  //     WHERE "supportId" = ${supportId}
  //     AND "startTime" < ${end}
  //     AND ("startTime" + INTERVAL '1 minute' * "duration") > ${start}
  //   `;

  //     if (excludeAppointmentId) {
  //       query = Prisma.sql`
  //       ${query}
  //       AND "id" != ${excludeAppointmentId}
  //     `;
  //     }

  //     console.log("Executing query:", query);
  //     const conflictingAppointments = await this.prisma.$queryRaw(query);
  //     console.log("Conflicting appointments:", conflictingAppointments);

  //     return conflictingAppointments.length === 0;
  //   } catch (error) {
  //     console.error("[Support Model] Availability Check Error:", error);
  //     throw new Error("Failed to check availability");
  //   }
  // }

  async checkAvailability(
    supportId,
    startTime,
    duration,
    excludeAppointmentId = null
  ) {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000); // Convert duration to milliseconds

    console.log("Checking availability for support:", supportId);
    console.log("Start time:", startTime);
    console.log("Duration:", duration);
    console.log("Exclude appointment ID:", excludeAppointmentId);
    console.log("Time range:", start, "to", end);

    try {
      // 1. Check if support is marked as available
      const support = await this.prisma.supportDetails.findUnique({
        where: { id: supportId },
        select: { available: true },
      });

      if (!support?.available) {
        console.log("Support is not available (marked as unavailable).");
        return false;
      }

      // 2. Check for appointment conflicts
      const conflicts = await this.prisma.$queryRaw`
      SELECT * FROM "Appointment"
      WHERE "supportId" = ${supportId}
      AND "id" != ${excludeAppointmentId}
      AND (
        ("startTime" < ${end} AND ("startTime" + INTERVAL '1 minute' * "duration") > ${start}) OR
        ("startTime" >= ${start} AND ("startTime" + INTERVAL '1 minute' * "duration") <= ${end})
      )
    `;

      if (conflicts.length > 0) {
        console.log("Conflicting appointments found:", conflicts);
        return false;
      }

      // 3. If no conflicts, the support is available
      console.log("No conflicting appointments found. Support is available.");
      return true;
    } catch (error) {
      console.error("[Support Model] Availability Check Error:", error);
      throw new Error("Failed to check availability");
    }
  }
}

module.exports = new SupportModel();
