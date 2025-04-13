const jwt = require("jsonwebtoken");
const logger = require("./logger");

const generateTokens = (payload) => {
  try {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not configured");
    }

    // Generate tokens
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
      algorithm: "HS256",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(`Token generation failed: ${error.message}`, {
      stack: error.stack,
    });
    throw new Error("Token generation failed");
  }
};

const verifyToken = (token, type = "access") => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const secret =
      type === "access"
        ? process.env.JWT_ACCESS_SECRET
        : process.env.JWT_REFRESH_SECRET;

    if (!secret) {
      throw new Error(`JWT ${type} secret is not configured`);
    }

    // Debug: Log verification details
    console.log(`Verifying ${type} token with secret:`, secret);

    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

    // Debug: Log decoded token
    console.log("Decoded Token:", decoded);

    return decoded;
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`, {
      stack: error.stack,
    });
    throw new Error("Invalid token");
  }
};

module.exports = { generateTokens, verifyToken };
