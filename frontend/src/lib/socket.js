import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Replace with your backend URL

socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

export default socket;
