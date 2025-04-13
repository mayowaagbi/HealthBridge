const { z } = require("zod");
// const { UserRole } = require("../models/user");
// import { UserRole } from "@prisma/client";
const UserRole = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  PROVIDER: "PROVIDER",
  SUPPORT: "SUPPORT",
};
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password cannot exceed 32 characters"),
  role: z
    .string()
    .transform((val) => val.toUpperCase()) // Transform the role to uppercase
    .refine((val) => Object.values(UserRole).includes(val), {
      message: "Invalid role selected",
    }),
  profile: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use YYYY-MM-DD.",
    }),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  }),
});
// const registerSchema = z.object({
//   name: z.string().min(2), // Added 'name'
//   email: z.string().email(),
//   password: z.string().min(8).max(32),
// });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
