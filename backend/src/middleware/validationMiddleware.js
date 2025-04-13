const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate request body using Zod
      req.body = schema.parse(req.body);
      next(); // Proceed to the next middleware/controller if validation passes
    } catch (error) {
      // Handle validation errors
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors, // Zod provides detailed error information
      });
    }
  };
};

module.exports = { validateRequest };
