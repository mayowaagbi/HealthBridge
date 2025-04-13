const { PrismaClient } = require("@prisma/client");
const { ApiError } = require("../utils/apiError");
const logger = require("../utils/logger");

class AppointmentService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      // logger.info(`Creating appointment for student model ${studentId}`);
      console.log("Appointment Data model:", appointmentData);
      return await this.prisma.appointment.create({
        data: {
          studentId: appointmentData.studentId,
          service: appointmentData.service,
          startTime: new Date(appointmentData.startTime),
          duration: Number(appointmentData.duration),
          notes: appointmentData.notes,
          status: "PENDING",
        },
      });
    } catch (error) {
      logger.error("Failed to create appointment:", error);
      throw new ApiError(500, "Failed to create appointment");
    }
  }

  // Fetch all appointments for a student
  async getAppointmentsByStudentId(studentId) {
    try {
      logger.info(`Fetching appointments for studentId: ${studentId}`);

      const appointments = await this.prisma.appointment.findMany({
        where: { studentId },
        include: {
          student: { include: { profile: true } },
          provider: { include: { profile: true } },
          support: { include: { profile: true } },
        },
      });

      logger.info(
        `Fetched ${appointments.length} appointments for studentId: ${studentId}`
      );
      return appointments;
    } catch (error) {
      logger.error("Failed to fetch appointments:", error);
      throw new ApiError(500, "Failed to fetch appointments");
    }
  }

  // Fetch a single appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      logger.info(
        `[Appointment Service] Fetching appointment ${appointmentId}`
      );

      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          student: { include: { profile: true } },
          provider: { include: { profile: true } },
          support: { include: { profile: true } },
        },
      });

      if (!appointment) {
        logger.warn(
          `[Appointment Service] Appointment ${appointmentId} not found`
        );
        throw new ApiError(404, "Appointment not found");
      }

      logger.info(
        `[Appointment Service] Successfully retrieved appointment ${appointmentId}`
      );
      return appointment;
    } catch (error) {
      logger.error(
        `[Appointment Service] Error getting appointment ${appointmentId}:`,
        error
      );
      throw new ApiError(500, "Failed to retrieve appointment");
    }
  }

  // Update an appointment
  async updateAppointment(appointmentId, updateData) {
    try {
      const appointment = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: updateData,
      });
      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }
      return appointment;
    } catch (error) {
      logger.error("Failed to update appointment:", error);
      throw new ApiError(500, "Failed to update appointment");
    }
  }

  // Delete an appointment
  async deleteAppointment(appointmentId) {
    try {
      const appointment = await this.prisma.appointment.delete({
        where: { id: appointmentId },
      });
      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }
      return { message: "Appointment deleted successfully" };
    } catch (error) {
      logger.error("Failed to delete appointment:", error);
      throw new ApiError(500, "Failed to delete appointment");
    }
  }

  // Cancel an appointment
  async cancelAppointment(appointmentId) {
    try {
      const appointment = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" },
      });
      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }
      return { message: "Appointment cancelled successfully" };
    } catch (error) {
      logger.error("Failed to cancel appointment:", error);
      throw new ApiError(500, "Failed to cancel appointment");
    }
  }

  // Reschedule an appointment
  async rescheduleAppointment(appointmentId, updateData) {
    try {
      logger.info(`Rescheduling appointment ${appointmentId}`);
      console.log("[Service] Rescheduling appointment:", appointmentId);
      console.log("[Service] Update data:", updateData);

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: new Date(updateData.startTime),
          duration: updateData.duration,
          notes: updateData.notes,
          status: updateData.status || "PENDING",
        },
      });

      if (!updatedAppointment) {
        console.error("[Service] Appointment not found:", appointmentId);
        throw new ApiError(404, "Appointment not found");
      }

      logger.info(`Appointment ${appointmentId} rescheduled successfully`);
      console.log(
        "[Service] Appointment rescheduled successfully:",
        updatedAppointment
      );
      return updatedAppointment;
    } catch (error) {
      logger.error("Failed to reschedule appointment:", error);
      throw new ApiError(500, "Failed to reschedule appointment");
    }
  }

  // Count appointments for today
  async countToday(providerId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.prisma.appointment.count({
      where: {
        providerId,
        startTime: { gte: todayStart, lte: todayEnd },
      },
    });
  }

  // Weekly overview of appointments
  async weeklyOverview(providerId) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return this.prisma.appointment.groupBy({
      by: ["startTime"],
      where: {
        providerId,
        startTime: { gte: startDate },
      },
      _count: { _all: true },
      orderBy: { startTime: "asc" },
    });
  }

  // Get provider appointments
  async getProviderAppointments(providerId) {
    try {
      return await this.prisma.appointment.findMany({
        where: { providerId },
        include: {
          student: { include: { profile: true } },
          provider: { include: { profile: true } },
          support: { include: { profile: true } },
        },
      });
    } catch (error) {
      logger.error("Failed to fetch provider appointments:", error);
      throw new ApiError(500, "Failed to fetch appointments");
    }
  }

  // Update appointment status
  async updateStatus(id, status, providerId) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }

      if (appointment.providerId !== providerId) {
        throw new ApiError(403, "Not authorized to modify this appointment");
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          student: { include: { profile: true } },
          provider: { include: { profile: true } },
        },
      });

      return updatedAppointment;
    } catch (error) {
      logger.error("Failed to update status:", error);
      throw new ApiError(500, "Failed to update appointment status");
    }
  }

  // Assign support to an appointment
  async assignSupport(appointmentId, supportId, providerId) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }

      // if (appointment.providerId !== providerId) {
      //   throw new ApiError(403, "Not authorized to modify this appointment");
      // }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { supportId },
        include: {
          support: { include: { profile: true } },
        },
      });

      return updatedAppointment;
    } catch (error) {
      logger.error("Failed to assign support:", error);
      throw new ApiError(500, "Failed to assign support");
    }
  }

  // Get all appointments
  async getAllAppointments() {
    try {
      return await this.prisma.appointment.findMany({
        include: {
          student: { include: { profile: true } },
          provider: { include: { profile: true } },
          support: { include: { profile: true } },
        },
      });
    } catch (error) {
      logger.error("Failed to fetch all appointments:", error);
      throw new ApiError(500, "Failed to fetch appointments");
    }
  }
  async checkAvailability(
    supportId,
    startTime,
    duration,
    excludeAppointmentId = null
  ) {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000); // Convert duration to milliseconds

    try {
      let query = Prisma.sql`
      SELECT * FROM "Appointment"
      WHERE "supportId" = ${supportId}
      AND "startTime" < ${end}
      AND ("startTime" + INTERVAL '1 minute' * "duration") > ${start}
    `;

      if (excludeAppointmentId) {
        query = Prisma.sql`
        SELECT * FROM (${query}) AS subquery
        WHERE "id" != ${excludeAppointmentId}
      `;
      }

      const conflictingAppointments = await this.prisma.$queryRaw(query);
      return conflictingAppointments.length === 0;
    } catch (error) {
      console.error("[Support Model] Availability Check Error:", error);
      throw new Error("Failed to check availability");
    }
  }
  // async updateStatus(id, status, providerId) {
  //   try {
  //     // Update the appointment status
  //     console.log("[Service] Updating appointment status:", {
  //       id,
  //       status,
  //       providerId,
  //     });

  //     const updatedAppointment = await this.prisma.appointment.update({
  //       where: { id },
  //       data: { status, providerId },
  //       include: {
  //         student: {
  //           include: { profile: { include: { user: true } } },
  //         },
  //         provider: {
  //           include: { profile: true },
  //         },
  //       },
  //     });

  //     return updatedAppointment;
  //   } catch (error) {
  //     logger.error("Failed to update status:", error);
  //     throw new ApiError(500, "Failed to update appointment status");
  //   }
  // }
  async updateStatus(id, status, userId) {
    try {
      console.log("[Service] Updating appointment status:", {
        id,
        status,
        userId,
      });

      // Validate the user is a registered provider
      const provider = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: {
              providerDetails: true,
            },
          },
        },
      });

      if (!provider?.profile?.providerDetails) {
        throw new ApiError(403, "User is not a registered provider");
      }

      const providerId = provider.profile.providerDetails.id;

      // Get the existing appointment
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }

      // Perform the update
      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: { status, providerId }, // Update both status and providerId
        include: {
          student: {
            include: { profile: { include: { user: true } } },
          },
          provider: {
            include: { profile: true },
          },
        },
      });

      return updatedAppointment;
    } catch (error) {
      logger.error("Failed to update appointment status:", error);

      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new ApiError(404, "Appointment not found");
        }
        if (error.code === "P2003") {
          throw new ApiError(400, "Invalid provider ID");
        }
      }

      // Handle custom ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Generic error
      throw new ApiError(500, "Failed to update appointment");
    }
  }
  async findAppointmentsByStudentId(studentId) {
    return this.prisma.appointment.findMany({
      where: { studentId },
      include: {
        student: { include: { profile: true } },
        provider: { include: { profile: true } },
        support: { include: { profile: true } },
      },
      orderBy: { startTime: "desc" }, // Sort by most recent first
    });
  }
  async updateAppointmentLocation(appointmentId, location) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { location },
      include: {
        student: { include: { profile: true } },
        support: { include: { profile: true } },
      },
    });
  }
}

module.exports = new AppointmentService();
