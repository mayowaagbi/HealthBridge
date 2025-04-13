const { z } = require("zod");
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(32);
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
const uuidSchema = z.string().uuid();

const validateEmail = (email) => emailSchema.safeParse(email);
const validatePassword = (password) => passwordSchema.safeParse(password);

module.exports = { validateEmail, validatePassword, phoneSchema, uuidSchema };
