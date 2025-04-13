const { z } = require("zod");
const healthRecordSchema = z.object({
  diagnosis: z.string().min(3),
  prescription: z.string().min(3),
  notes: z.string().max(1000).optional(),
});

const documentUploadSchema = z.object({
  recordId: z.string().uuid(),
  file: z.any().refine((file) => file, "File is required"),
});

module.exports = { healthRecordSchema, documentUploadSchema };
