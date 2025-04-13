const rateLimit = require("express-rate-limit");

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many login attempts, please try again later",
});

const geoLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: process.env.MAX_GEO_REQUESTS || 1000,
  message: "Too many location updates",
});

module.exports = { apiRateLimiter, authRateLimiter, geoLimiter };
