import React, { useEffect } from "react";
import socket from "../hooks/sockets"; // Adjust the import path
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the Alert interface outside the component
interface Alert {
  title: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  endTime: string;
}

const AlertNotification = () => {
  useEffect(() => {
    console.log("Socket object:", socket); // Debugging: Check the socket object
    console.log("Socket connected:", socket.connected);

    // Listen for connection events
    const handleConnect = () => {
      console.log("Connected to Socket.IO server");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from Socket.IO server");
    };

    // Listen for new alerts
    const handleNewAlert = (alert: Alert) => {
      console.log("New alert received:", alert);
      toast.info(
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                alert.priority === "HIGH"
                  ? "bg-red-100 text-red-800"
                  : alert.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {alert.priority}
            </span>
            <span className="text-xs text-gray-500">
              Expires: {new Date(alert.endTime).toLocaleString()}
            </span>
          </div>
        </div>,
        { autoClose: 10000 }
      );
    };

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new-alert", handleNewAlert);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new-alert", handleNewAlert);
    };
  }, []); // Empty dependency array to run only once
  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-container"
      />
    </div>
  );
};

export default AlertNotification;
