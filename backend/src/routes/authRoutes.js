const express = require("express");
const { AuthController } = require("../controllers/authController");
const { validateRequest } = require("../middleware/validationMiddleware");
const {
  loginSchema,
  registerSchema,
} = require("../validations/authValidation");
const router = express.Router();

router.post(
  "/register",
  (req, res, next) => {
    console.log("Received POST request:", req.params, req.body);
    next();
  },
  AuthController.register
);

router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

module.exports = router;
