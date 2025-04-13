const { z } = require("zod");

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  avatar: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

module.exports = { updateProfileSchema, changePasswordSchema };
