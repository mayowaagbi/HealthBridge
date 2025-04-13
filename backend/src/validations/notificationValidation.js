const { z } = require("zod");

const notificationSchema = z.object({
  message: z.string().min(10).max(500),
  userIds: z.array(z.string().uuid()).min(1),
});

const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});

module.exports = { notificationSchema, markReadSchema };
