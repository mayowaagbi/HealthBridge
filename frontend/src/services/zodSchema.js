import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .nonempty({ message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .nonempty({ message: "Password is required" }),
});
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .nonempty({ message: "First name is required" })
      .max(50, { message: "First name must not exceed 50 characters" }),
    lastName: z
      .string()
      .nonempty({ message: "Last name is required" })
      .max(50, { message: "Last name must not exceed 50 characters" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .nonempty({ message: "Email is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/[@$!%*?&]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
