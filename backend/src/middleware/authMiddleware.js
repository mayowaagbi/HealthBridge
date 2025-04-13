const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
// Import User correctly (without destructuring)
const User = require("../models/User.js");

const authenticate = async (req, res, next) => {
  // console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    // Use the correct secret from your environment variables
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });

    // Now, call findById on the imported User instance
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    logger.error("Token verification failed", {
      error: err.message,
      stack: err.stack,
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

const authorizeProvider = (req, res, next) => {
  if (req.user.role !== "PROVIDER") {
    return res.status(403).json({ error: "Provider access required" });
  }
  next();
};
module.exports = { authenticate, authorize, authorizeProvider };
