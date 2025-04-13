import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io(
      process.env.REACT_APP_API_URL || "http://localhost:5000",
      {
        auth: { token },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      socketInstance.emit("getInitialNotifications");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setError(`Socket connection error: ${err.message}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ data: Notification[] }>(
          "/api/notifications"
        );
        setNotifications(res.data.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.response?.data?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const value: NotificationContextType = {
    notifications,
    loading,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
