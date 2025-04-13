const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const connectedUsers = new Map();
let io;

/**
 * Initialize Socket.IO
 * @param {Object} socketIo - Socket.IO instance
 */
const initialize = (socketIo) => {
  io = socketIo;
};

/**
 * Socket.IO Authentication Middleware
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    // console.log("Token:", token);

    if (!token) {
      console.error("Socket connection rejected: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      console.error("Socket connection rejected: User not found");
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    return next(new Error("Authentication failed"));
  }
};

/**
 * Setup Socket.IO Event Handlers
 */
const setupSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    if (!socket.user) {
      console.error("Socket connection missing user data");
      return;
    }

    const userId = socket.user.id;
    const userRole = socket.user.role;

    console.log(`User connected: ${userId}, Role: ${userRole}`);

    // Store user connection with their socket ID
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Join room based on role
    if (userRole) {
      socket.join(userRole.toLowerCase());
    }

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);

      // Remove socket ID from user's connections
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Get initial notifications for user
    // socket.on("getInitialNotifications", async () => {
    //   try {
    //     // const notifications = await prisma.notification.findMany({
    //     //   where: { userId: userId, read: false },
    //     //   orderBy: { createdAt: "desc" },
    //     //   take: 10,
    //     // });
    //     const notifications = await prisma.alert.findMany({
    //       where: { status: "ACTIVE" },
    //       orderBy: { createdAt: "desc" },
    //     });

    //     socket.emit("initialNotifications", notifications);
    //   } catch (error) {
    //     console.error("Error fetching initial notifications:", error);
    //   }
    // });
    socket.on("getInitialNotifications", async () => {
      try {
        // Fetch active alerts
        const alerts = await prisma.alert.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        });

        // Fetch pending ambulance requests
        const ambulanceRequests = await prisma.ambulanceRequest.findMany({
          where: { status: "PENDING" }, // Adjust the status filter as needed
          orderBy: { createdAt: "desc" },
        });

        // Transform alerts into notifications
        const alertNotifications = alerts.map((alert) => ({
          id: alert.id,
          type: "alert", // Add type to differentiate
          title: alert.title,
          message: alert.message,
          createdAt: alert.createdAt,
          // Include other fields as needed
        }));

        // Transform ambulance requests into notifications
        const ambulanceRequestNotifications = ambulanceRequests.map(
          (request) => ({
            id: request.id,
            type: "ambulance-request", // Add type to differentiate
            title: "Ambulance Request", // Default title
            message: `Ambulance requested at ${request.address}`, // Custom message
            createdAt: request.createdAt,
            // Include other fields as needed
          })
        );

        // Combine into a single notifications array
        const notifications = [
          ...alertNotifications,
          ...ambulanceRequestNotifications,
        ];

        // Emit the combined notifications
        socket.emit("initialNotifications", notifications);
      } catch (error) {
        console.error("Error fetching initial notifications:", error);
      }
    });
  });
};

/**
 * Send Notification to Specific Roles
 */
const sendRoleNotification = async (role, notification) => {
  try {
    // Validate inputs
    if (!io || typeof io.emit !== "function") {
      console.error("Socket.IO instance not initialized");
      return { success: false, message: "Socket.IO not initialized" };
    }

    if (typeof role !== "string") {
      console.error("Invalid role parameter:", role);
      return { success: false, message: "Role must be a string" };
    }

    // Normalize role casing
    const normalizedRole = role.toUpperCase();
    const roomName = normalizedRole.toLowerCase();

    console.log(`Broadcasting notification to role: ${normalizedRole}`);
    console.log("Notification data:", notification);

    // Get users with the specified role
    const users = await prisma.user.findMany({
      where: { role: normalizedRole },
      select: { id: true },
    });

    if (!users.length) {
      console.warn(`No users found with role: ${normalizedRole}`);
      return {
        success: false,
        message: `No users found with role: ${normalizedRole}`,
      };
    }

    // Create notifications in bulk
    const createdNotifications = await prisma.$transaction(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: notification.type || "info",
            title: notification.title,
            content: notification.message,
            priority: notification.priority || 3,
            expiresAt: notification.expiresAt,
          },
        })
      )
    );

    // Broadcast to the role room
    io.to(roomName).emit("notification", {
      ...notification,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: `Notification sent to ${users.length} ${normalizedRole} users`,
      data: createdNotifications,
    };
  } catch (error) {
    console.error("Error sending role notification:", error);
    return { success: false, message: "Failed to send notification", error };
  }
};

/**
 * Send Notification to a Specific User
 */
const sendUserNotification = async (userId, notification) => {
  try {
    if (!io) {
      console.error("sendUserNotification: io socket object is undefined");
      return { success: false, message: "Socket.IO not initialized" };
    }

    if (!userId) {
      console.error("sendUserNotification: User ID is undefined");
      return { success: false, message: "User ID is required" };
    }

    // Create a single notification
    const newNotification = await prisma.notification.create({
      data: {
        userId: userId,
        type: notification.type || "info",
        title: notification.title,
        content: notification.message,
        priority: notification.priority || 3,
        expiresAt: notification.expiresAt,
      },
    });

    // Send to the specific user if they're connected
    if (connectedUsers.has(userId)) {
      connectedUsers.get(userId).forEach((socketId) => {
        io.to(socketId).emit("notification", {
          ...newNotification,
          createdAt: new Date(),
        });
      });
    }

    return {
      success: true,
      message: "Notification sent to user",
      data: newNotification,
    };
  } catch (error) {
    console.error("Error sending user notification:", error);
    return { success: false, message: "Failed to send notification", error };
  }
};

/**
 * Example Usage of sendRoleNotification in a Controller
 */
const sendAlertNotification = async (req, res) => {
  try {
    const io = req.app.get("socketio");

    const result = await sendRoleNotification("student", {
      type: "alert",
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 3,
      expiresAt: new Date(Date.now() + req.body.duration * 60 * 60 * 1000),
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending alert notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  initialize,
  setupSocketHandlers,
  sendRoleNotification,
  sendUserNotification,
  sendAlertNotification,
  authenticateSocket,
};
