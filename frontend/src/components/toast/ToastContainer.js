import React from "react";
import Toast from "./Toast";
import { useNotifications } from "../../context/NotificationContext";
import "./toast.css";

const ToastContainer = () => {
  const { activeToasts, dismissToast, markAsRead } = useNotifications();

  const handleClose = (id) => {
    // Mark notification as read in the backend
    markAsRead(id);
    // Remove toast from view
    dismissToast(id);
  };

  return (
    <div className="toast-container">
      {activeToasts.map((toast) => (
        <Toast key={toast._id} notification={toast} onClose={handleClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
