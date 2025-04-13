// validations/geoValidation.js
const { z } = require("zod");
const geoDataSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ errors: error.errors });
  }
};

module.exports = { geoDataSchema, validateRequest };
