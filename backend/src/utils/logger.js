const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
    }),
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

module.exports = logger;
