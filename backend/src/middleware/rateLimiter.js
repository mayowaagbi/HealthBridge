const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");

const isRedisAvailable = redisClient && typeof redisClient.call === "function";

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later",
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many requests, please try again later" });
  },
};

if (isRedisAvailable) {
  rateLimitConfig.store = new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  });
}

const apiLimiter = rateLimit(rateLimitConfig);

console.log(
  `Rate limiter using ${isRedisAvailable ? "Redis" : "in-memory"} store.`
);

module.exports = apiLimiter;
