const { z } = require("zod");

// Validation schema for creating a health record
const createHealthRecordSchema = z.object({
  userId: z.string().uuid(),
  bloodPressure: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/)
    .optional(), // e.g., 120/80
  heartRate: z.number().min(30).max(200).optional(),
  temperature: z.number().min(35).max(42).optional(),
  notes: z.string().max(500).optional(),
  recordedAt: z.string().datetime().optional(),
});

// Validation schema for updating a health record
const updateHealthRecordSchema = z.object({
  bloodPressure: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/)
    .optional(),
  heartRate: z.number().min(30).max(200).optional(),
  temperature: z.number().min(35).max(42).optional(),
  notes: z.string().max(500).optional(),
});

// Validation schema for booking an appointment
const bookAppointmentSchema = z.object({
  userId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string().datetime(),
  reason: z.string().min(10).max(300),
});

// Validation schema for updating an appointment
const updateAppointmentSchema = z.object({
  date: z.string().datetime().optional(),
  reason: z.string().min(10).max(300).optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

module.exports = {
  createHealthRecordSchema,
  updateHealthRecordSchema,
  bookAppointmentSchema,
  updateAppointmentSchema,
};
