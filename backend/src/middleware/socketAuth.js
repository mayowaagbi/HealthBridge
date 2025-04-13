// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const authenticateSocket = async (socket, next) => {
//   try {
//     console.log("Socket handshake auth:", socket.handshake.auth);
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error("Authentication error"));

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded token socket auth:", decoded);
//     const user = await User.findById(decoded.id);

//     if (!user) return next(new Error("User not found"));

//     socket.user = {
//       id: user.id,
//       role: user.role,
//       name: user.name,
//     };
//     console.log("Authenticated user:", socket.user); // Debugging
//     next();
//   } catch (error) {
//     next(new Error("Authentication failed"));
//   }
// };

// module.exports = authenticateSocket;
