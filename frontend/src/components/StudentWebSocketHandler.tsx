import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../hooks/sockets";

interface Alert {
  id: string;
  title: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  endTime: string;
}

const StudentWebSocketHandler = () => {
  const { isLoggedIn, userRole } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    if (!isLoggedIn || userRole !== "STUDENT") return;

    const handleNewAlert = (alert: Alert) => {
      toast.info(
        <div>
          <h4>{alert.title}</h4>
          <p>{alert.message}</p>
          <div>
            <span>Priority: {alert.priority}</span>
            <br />
            <span>Expires: {new Date(alert.endTime).toLocaleString()}</span>
          </div>
        </div>,
        { autoClose: 10000 }
      );
    };

    socket.on("new-alert", handleNewAlert);

    return () => {
      socket.off("new-alert", handleNewAlert);
    };
  }, [isLoggedIn, userRole, socket]);

  return null;
};

export default StudentWebSocketHandler;
