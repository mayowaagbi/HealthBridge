// import { io, Socket } from "socket.io-client";

// // Use a more reliable singleton pattern
// let socketInstance: Socket | null = null;

// /**
//  * Get the Socket.IO instance (singleton pattern)
//  * @returns {Socket | null} The Socket.IO instance or null if no token
//  */
// export const getSocket = (): Socket | null => {
//   if (!socketInstance) {
//     // Get token with error handling
//     const token = localStorage.getItem("accessToken");
//     if (!token) {
//       console.warn("No access token found. User must be authenticated.");
//       return null;
//     }

//     console.log(
//       "Initializing socket with token:",
//       token.substring(0, 10) + "..."
//     );

//     // Create socket with both transports and proper auth
//     socketInstance = io("http://localhost:3000", {
//       path: "/socket.io/",
//       transports: ["websocket", "polling"],
//       autoConnect: false,
//       auth: {
//         token: token,
//       },
//       extraHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//       withCredentials: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 10000,
//     });

//     // Enhanced logging
//     socketInstance.on("connect", () => {
//       console.log("Socket.IO connected successfully:", socketInstance.id);

//       // Request initial notifications on first connect
//       console.log("Requesting initial notifications");
//       socketInstance.emit("getInitialNotifications");
//     });

//     socketInstance.on("connect_error", (error) => {
//       console.error("Socket.IO connection error:", error.message);
//       console.error("Error details:", error);

//       // Log authentication status
//       const token = localStorage.getItem("accessToken");
//       console.log("Current token available:", !!token);
//     });

//     socketInstance.on("disconnect", (reason) => {
//       console.log("Socket.IO disconnected:", reason);

//       if (reason === "io server disconnect") {
//         // Server disconnected us, try reconnecting
//         console.log(
//           "Server disconnected the socket, attempting to reconnect..."
//         );
//         socketInstance.connect();
//       }
//     });

//     // Debug events
//     socketInstance.on("error", (error) => {
//       console.error("Socket.IO error:", error);
//     });

//     socketInstance.io.on("reconnect", (attempt) => {
//       console.log(`Socket.IO reconnected after ${attempt} attempts`);
//     });

//     socketInstance.io.on("reconnect_attempt", (attempt) => {
//       console.log(`Socket.IO reconnection attempt: ${attempt}`);

//       // Refresh token on reconnect attempts
//       const freshToken = localStorage.getItem("accessToken");
//       if (freshToken) {
//         socketInstance.auth = { token: freshToken };
//         socketInstance.io.opts.extraHeaders = {
//           Authorization: `Bearer ${freshToken}`,
//         };
//       }
//     });
//   }

//   return socketInstance;
// };

// /**
//  * Connect the Socket.IO instance if not already connected
//  * @returns {Socket | null} The connected socket or null if connection failed
//  */
// export const connectSocket = (): Socket | null => {
//   try {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       console.warn("No access token found. User must be authenticated.");
//       return null;
//     }

//     const socket = getSocket();
//     if (!socket) {
//       console.warn("Failed to initialize socket");
//       return null;
//     }

//     if (!socket.connected) {
//       console.log(
//         "Connecting socket with token:",
//         token.substring(0, 10) + "..."
//       );

//       // Ensure auth is set with latest token before connecting
//       socket.auth = { token };

//       // Connect socket
//       socket.connect();

//       // Verify connection after a short delay
//       setTimeout(() => {
//         if (!socket.connected) {
//           console.warn("Socket still not connected after connection attempt");
//         } else {
//           console.log("Socket connection verified");
//         }
//       }, 2000);
//     } else {
//       console.log("Socket already connected:", socket.id);
//     }

//     return socket;
//   } catch (error) {
//     console.error("Error in connectSocket:", error);
//     return null;
//   }
// };

// /**
//  * Disconnect the Socket.IO instance
//  */
// export const disconnectSocket = (): void => {
//   if (socketInstance) {
//     console.log("Disconnecting socket...");
//     socketInstance.disconnect();
//     socketInstance = null; // Reset the socket instance
//     console.log("Socket disconnected successfully.");
//   } else {
//     console.warn("No active socket to disconnect.");
//   }
// };

// /**
//  * Register the user with the Socket.IO server based on their role
//  * @param {string} role - The user's role ("STUDENT" or "PROVIDER")
//  * @param {string} id - The user's ID
//  * @returns {boolean} Whether registration was initiated
//  */
// export const registerSocket = (
//   role: "STUDENT" | "PROVIDER",
//   id: string
// ): boolean => {
//   try {
//     const socket = getSocket();

//     if (!socket) {
//       console.error("Cannot register: Socket initialization failed");
//       return false;
//     }

//     const register = () => {
//       if (role === "STUDENT") {
//         socket.emit("register-student", id);
//         console.log(`Registered student ${id}`);
//       } else if (role === "PROVIDER") {
//         socket.emit("register-provider", id);
//         console.log(`Registered provider ${id}`);
//       } else {
//         console.error("Invalid role for Socket.IO registration:", role);
//         return false;
//       }
//       return true;
//     };

//     if (socket.connected) {
//       return register();
//     } else {
//       console.log("Socket not connected, setting up one-time connect listener");
//       socket.once("connect", register);

//       // Make sure socket is connecting
//       if (!socket.connected) {
//         connectSocket();
//       }
//       return true; // Registration will happen when connected
//     }
//   } catch (error) {
//     console.error("Error in registerSocket:", error);
//     return false;
//   }
// };
import { io, Socket } from "socket.io-client";

// Use a more reliable singleton pattern
let socketInstance: Socket | null = null;

/**
 * Get the Socket.IO instance (singleton pattern)
 * @returns {Socket | null} The Socket.IO instance or null if no token
 */
export const getSocket = (): Socket | null => {
  if (!socketInstance) {
    // Get token with error handling
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found. User must be authenticated.");
      return null;
    }

    console.log(
      "Initializing socket with token:",
      token.substring(0, 10) + "..."
    );

    // Create socket with both transports and proper auth
    socketInstance = io("http://localhost:3000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: false,
      auth: {
        token: token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Enhanced logging
    socketInstance.on("connect", () => {
      if (!socketInstance) return; // Safety check

      console.log("Socket.IO connected successfully:", socketInstance.id);

      // Request initial notifications on first connect
      console.log("Requesting initial notifications");
      socketInstance.emit("getInitialNotifications");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      console.error("Error details:", error);

      // Log authentication status
      const token = localStorage.getItem("accessToken");
      console.log("Current token available:", !!token);
    });

    socketInstance.on("disconnect", (reason) => {
      if (!socketInstance) return; // Safety check

      console.log("Socket.IO disconnected:", reason);

      if (reason === "io server disconnect") {
        // Server disconnected us, try reconnecting
        console.log(
          "Server disconnected the socket, attempting to reconnect..."
        );
        socketInstance.connect();
      }
    });

    // Debug events
    socketInstance.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    socketInstance.io.on("reconnect", (attempt) => {
      console.log(`Socket.IO reconnected after ${attempt} attempts`);
    });

    socketInstance.io.on("reconnect_attempt", (attempt) => {
      if (!socketInstance) return; // Safety check

      console.log(`Socket.IO reconnection attempt: ${attempt}`);

      // Refresh token on reconnect attempts
      const freshToken = localStorage.getItem("accessToken");
      if (freshToken) {
        socketInstance.auth = { token: freshToken };
        socketInstance.io.opts.extraHeaders = {
          Authorization: `Bearer ${freshToken}`,
        };
      }
    });
  }

  return socketInstance;
};

/**
 * Connect the Socket.IO instance if not already connected
 * @returns {Socket | null} The connected socket or null if connection failed
 */
export const connectSocket = (): Socket | null => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("No access token found. User must be authenticated.");
      return null;
    }

    const socket = getSocket();
    if (!socket) {
      console.warn("Failed to initialize socket");
      return null;
    }

    if (!socket.connected) {
      console.log(
        "Connecting socket with token:",
        token.substring(0, 10) + "..."
      );

      // Ensure auth is set with latest token before connecting
      socket.auth = { token };

      // Connect socket
      socket.connect();

      // Verify connection after a short delay
      setTimeout(() => {
        if (!socket || !socket.connected) {
          console.warn("Socket still not connected after connection attempt");
        } else {
          console.log("Socket connection verified");
        }
      }, 2000);
    } else {
      console.log("Socket already connected:", socket.id);
    }

    return socket;
  } catch (error) {
    console.error("Error in connectSocket:", error);
    return null;
  }
};

/**
 * Disconnect the Socket.IO instance
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    console.log("Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null; // Reset the socket instance
    console.log("Socket disconnected successfully.");
  } else {
    console.warn("No active socket to disconnect.");
  }
};

/**
 * Register the user with the Socket.IO server based on their role
 * @param {string} role - The user's role ("STUDENT" or "PROVIDER")
 * @param {string} id - The user's ID
 * @returns {boolean} Whether registration was initiated
 */
export const registerSocket = (
  role: "STUDENT" | "PROVIDER",
  id: string
): boolean => {
  try {
    const socket = getSocket();

    if (!socket) {
      console.error("Cannot register: Socket initialization failed");
      return false;
    }

    const register = () => {
      if (!socket) return false; // Safety check

      if (role === "STUDENT") {
        socket.emit("register-student", id);
        console.log(`Registered student ${id}`);
      } else if (role === "PROVIDER") {
        socket.emit("register-provider", id);
        console.log(`Registered provider ${id}`);
      } else {
        console.error("Invalid role for Socket.IO registration:", role);
        return false;
      }
      return true;
    };

    if (socket.connected) {
      return register();
    } else {
      console.log("Socket not connected, setting up one-time connect listener");
      socket.once("connect", register);

      // Make sure socket is connecting
      if (!socket.connected) {
        connectSocket();
      }
      return true; // Registration will happen when connected
    }
  } catch (error) {
    console.error("Error in registerSocket:", error);
    return false;
  }
};
