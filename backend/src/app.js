const express = require("express");
const { config } = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

// Load environment variables
config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const fileRoutes = require("./routes/fileRoutes");
const waterRoutes = require("./routes/waterRoutes");
const georoutes = require("./routes/geoRoutes");
const entryRoutes = require("./routes/entryRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const healthRoutes = require("./routes/healthRoutes");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const documentRoutes = require("./routes/documentRoutes");
const healthproviderdashboardRoutes = require("./routes/healthproviderdashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const supportRoutes = require("./routes/supportRoutes");
const alertRoutes = require("./routes/alertRoutes");
const healthRouter = require("./routes/dailyHealthRoutes");
const nodemailer = require("nodemailer");
// Import middleware
const { authenticate } = require("./middleware/authMiddleware");
const apiLimiter = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { setupSocketHandlers, initialize } = require("./utils/sockets");
const { authenticateSocket } = require("./utils/sockets");

// Import utilities
const logger = require("./utils/logger");

// Initialize Express
const app = express();
const httpServer = createServer(app);

// Ensure temporary directory exists
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware pipeline
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use(apiLimiter);
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true, // Return error if file size exceeds limit
    useTempFiles: true, // Use temporary files for uploads
    tempFileDir: tempDir, // Use custom temporary directory
  })
);

// Store connected users
const users = new Map();

// Configure Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Socket.io middleware and handlers
io.use(authenticateSocket);
app.set("socketio", io);
initialize(io);
setupSocketHandlers(io);

// Public routes
app.use("/api/auth", authRoutes);

// Authenticated routes
app.use("/api/users", authenticate, userRoutes);
app.use("/api/appointments", authenticate, appointmentRoutes);
app.use("/api/health-records", authenticate, healthRoutes);
app.use("/api/emergency", authenticate, emergencyRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/geo", georoutes);
app.use("/api", entryRoutes);
app.use("/api/ambulance-requests", ambulanceRoutes(io));
app.use("/api/healthdata", healthRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/provider-dashboard", healthproviderdashboardRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/supports", supportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/health", healthRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling
app.use(notFound);
app.use(errorHandler);
// Contact form endpoint
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAILTRAP_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER || "your-mailtrap-user",
    pass: process.env.MAILTRAP_PASS || "your-mailtrap-pass",
  },
});
app.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        error: "All fields are required",
        received: req.body, // Log what was actually received
      });
    }
    console.log("Contact form data:");
    // Validate input
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Email options
    const mailOptions = {
      from: `"Contact Form" <${
        process.env.EMAIL_FROM || "noreply@healthbridge.com"
      }>`,
      to: process.env.CONTACT_EMAIL || "info@healthbridge.com",
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #4CAF50;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const userMailOptions = {
      from: `"HealthBridge Support" <${
        process.env.EMAIL_FROM || "noreply@healthbridge.com"
      }>`,
      to: email,
      subject: "Thank you for contacting HealthBridge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #4CAF50;">Thank you for reaching out!</h2>
          <p>Hello ${firstName},</p>
          <p>We've received your message and our team will get back to you as soon as possible.</p>
          <p>Here's a copy of your message for your records:</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p style="margin-top: 20px;">Best regards,<br>The HealthBridge Team</p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Server configuration
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Docs available at /api/docs`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received: Closing server");
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

module.exports = app;
