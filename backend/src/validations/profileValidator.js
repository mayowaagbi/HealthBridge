const { body } = require("express-validator");

const validateProfile = [
  // Validate firstName
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),

  // Validate lastName
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),

  // Validate phone
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any", { strictMode: false }) // Allow any valid phone number format
    .withMessage("Invalid phone number"),

  // Validate emergencyContacts (if provided)
  body("emergencyContacts")
    .optional() // Allow emergencyContacts to be optional
    .isArray()
    .withMessage("Emergency contacts must be an array")
    .custom((contacts) => {
      // Ensure each contact has a name and phone
      if (!contacts || contacts.length === 0) return true; // Allow empty array
      for (const contact of contacts) {
        if (!contact.name || !contact.phone) {
          throw new Error("Each contact must have a name and phone");
        }
      }
      return true;
    }),

  // Validate individual contact fields
  body("emergencyContacts.*.name")
    .optional() // Allow name to be optional if emergencyContacts is not provided
    .notEmpty()
    .withMessage("Contact name is required")
    .isString()
    .withMessage("Contact name must be a string"),

  body("emergencyContacts.*.phone")
    .optional() // Allow phone to be optional if emergencyContacts is not provided
    .notEmpty()
    .withMessage("Contact phone is required")
    .isMobilePhone("any", { strictMode: false }) // Allow any valid phone number format
    .withMessage("Invalid contact phone number"),

  body("emergencyContacts.*.relationship")
    .optional() // Allow relationship to be optional
    .isString()
    .withMessage("Contact relationship must be a string"),
];

module.exports = { validateProfile };
