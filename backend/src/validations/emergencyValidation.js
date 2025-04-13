const { z } = require("zod");
const emergencyContactSchema = z.object({
  name: z.string().min(2),
  relationship: z.string().min(2),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
});

const emergencyTriggerSchema = z.object({
  location: z.string().min(5),
});
module.exports = { emergencyContactSchema, emergencyTriggerSchema };
