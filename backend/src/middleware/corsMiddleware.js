const cors = require("cors");
/**
 * CORS configuration
 */
const corsOptions = {
  origin: process.env.CLIENT_URLS.split(","),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
module.exports = cors(corsOptions);
