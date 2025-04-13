const { Appointment } = require("../models");
const { ApiError } = require("../utils/apiError");
const logger = require("../utils/logger");

class AppointmentService {
  // Create a new appointment
  async createAppointment(studentId, appointmentData) {
    try {
      console.log(`Creating appointment for student ${studentId}`);
      console.log("[Service] Creating appointment:", appointmentData);
      return await Appointment.createAppointment({
        studentId,
        service: appointmentData.service,
        startTime: new Date(appointmentData.startTime),
        duration: Number(appointmentData.duration),
        notes: appointmentData.notes,
        status: "PENDING",
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

      const appointments = await Appointment.getAppointmentsByStudentId(
        studentId
      );

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
  // async getAppointmentById(appointmentId) {
  //   try {
  //     const appointment = await Appointment.getAppointmentsByStudentId(
  //       appointmentId
  //     );
  //     if (!appointment) {
  //       throw new ApiError(404, "Appointment not found");
  //     }
  //     return appointment;
  //   } catch (error) {
  //     logger.error("Failed to fetch appointment:", error);
  //     throw new ApiError(500, "Failed to fetch appointment");
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

      // Log the status change
      await this.logAppointmentHistory(id, status, userId);

      return updatedAppointment;
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      throw new ApiError(500, "Failed to update appointment status");
    }
  }
  async getAppointmentById(appointmentId) {
    try {
      logger.info(
        `[Appointment Service] Fetching appointment ${appointmentId}`
      );

      const appointment = await Appointment.getAppointmentById(appointmentId);

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

      // Preserve existing error status if available
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to retrieve appointment");
    }
  }
  // Update an appointment
  async updateAppointment(appointmentId, updateData) {
    try {
      const appointment = await Appointment.updateAppointment(
        appointmentId,
        updateData
      );
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
      const appointment = await Appointment.deleteAppointment(appointmentId);
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
      const appointment = await Appointment.updateStatus(
        appointmentId,
        "CANCELLED"
      );
      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }
      return { message: "Appointment cancelled successfully" };
    } catch (error) {
      logger.error("Failed to cancel appointment:", error);
      throw new ApiError(500, "Failed to cancel appointment");
    }
  }
  async rescheduleAppointment(appointmentId, updateData) {
    try {
      logger.info(`Rescheduling appointment ${appointmentId}`);
      console.log("[Service] Rescheduling appointment:", appointmentId);
      console.log("[Service] Update data:", updateData);
      const updatedAppointment = await Appointment.rescheduleAppointment(
        appointmentId,
        updateData
      );

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
  async countToday(providerId) {
    return Appointment.countToday(providerId);
  }

  async weeklyOverview(providerId) {
    return Appointment.weeklyOverview(providerId);
  }

  async assignSupport(id, supportId, providerId) {
    return await Appointment.assignSupport(id, supportId, providerId);
  }
  async getAllAppointments() {
    return await Appointment.getAllAppointments();
  }
  async updateStatus(id, status, providerId) {
    return await Appointment.updateStatus(id, status, providerId);
  }
  async updateAppointmentLocation(appointmentId, location) {
    try {
      logger.info(`Updating location for appointment ${appointmentId}`);
      console.log("[Service] Location:", location);

      const updatedAppointment = await Appointment.updateAppointmentLocation(
        appointmentId,
        location
      );

      if (!updatedAppointment) {
        throw new ApiError(404, "Appointment not found");
      }

      return updatedAppointment;
    } catch (error) {
      logger.error("Failed to update appointment location:", error);
      throw new ApiError(500, "Failed to update location");
    }
  }
  async getAppointmentHistory(appointmentId) {
    try {
      return this.prisma.appointmentHistory.findMany({
        where: { appointmentId },
        include: {
          changedBy: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { timestamp: "desc" }, // Sort by most recent first
      });
    } catch (error) {
      console.error("Failed to fetch appointment history:", error);
      throw new ApiError(500, "Failed to fetch appointment history");
    }
  }
  async getAppointmentsByStudentId(studentId) {
    try {
      return await Appointment.findAppointmentsByStudentId(studentId);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      throw new ApiError(500, "Failed to fetch appointments");
    }
  }
}

module.exports = new AppointmentService();
