import React, { useEffect, useState } from "react";
import "./toast.css";

interface Notification {
  _id: string;
  type: "success" | "error" | "warning" | "ambulance-request" | "info";
  title: string;
  message: string;
  data?: {
    timestamp?: number;
  };
}

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  autoClose?: number;
}

const Toast: React.FC<ToastProps> = ({
  notification,
  onClose,
  autoClose = 5000,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Set type-specific icon and background color
  let icon, className;
  switch (notification.type) {
    case "success":
      icon = "✓";
      className = "toast-success";
      break;
    case "error":
      icon = "✕";
      className = "toast-error";
      break;
    case "warning":
      icon = "⚠";
      className = "toast-warning";
      break;
    case "ambulance-request":
      icon = "🚑";
      className = "toast-ambulance";
      break;
    case "info":
    default:
      icon = "ℹ";
      className = "toast-info";
  }

  // Auto close toast after specified time
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => onClose(notification._id), 300); // Animation time
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, notification._id, onClose]);

  // Handle close button click
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(notification._id), 300); // Animation time
  };

  return (
    <div className={`toast ${className} ${isClosing ? "toast-closing" : ""}`}>
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <h4 className="toast-title">{notification.title}</h4>
        <p className="toast-message">{notification.message}</p>
        {notification.data?.timestamp && (
          <p className="toast-time">
            {new Date(notification.data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
      <button className="toast-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
