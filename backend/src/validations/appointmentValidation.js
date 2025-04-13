const { z } = require("zod");
const { AppointmentStatus } = require("../models/Appointment");
// import { AppointmentStatus } from "@prisma/client";
const createAppointmentSchema = z.object({
  service: z.string().min(1, "Service is required"),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  userId: z.string().uuid("Invalid user ID"),
  providerId: z.string().uuid("Invalid provider ID").nullable(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  startTime: z.coerce.date().optional(),
  duration: z.number().min(15).max(120).optional(),
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
