import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext"; // Import the ThemeProvider
import LandingPage from "./pages/LandingPage";

import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import NotFound from "./pages/NotFound";
import { GlobalStateProvider } from "./context/GlobalState";
import StudentDashboardPage from "./pages/StudentPages/StudentDashboardPage";

import StudentProfilePage from "./pages/StudentPages/StudentProfilePage";
import StudentAppointmentPage from "./pages/StudentPages/StudentAppointmentsPage";
import StudentHealthGoalsPage from "./pages/StudentPages/HealthGoalsPage";
import StudentHealthRecordsPage from "./pages/StudentPages/HealthRecordsPage";
import StudentNotificationsPage from "./pages/StudentPages/NotificationsPage";

import HealthcareProviderDashboard from "./pages/HealthCareProvider/HealthcareProviderDashboard";
import AppointmentManagementPage from "./pages/HealthCareProvider/HealthcareAppointmentManagementPage";
import PatientManagementPage from "./pages/HealthCareProvider/HealthcarePatientManagementPage";
import AlertsPage from "./pages/HealthCareProvider/HealthcareAlertsPage";
import HealthRecordsPage from "./pages/HealthCareProvider/HealthcareHealthRecordsPage";
import PrescriptionsPage from "./pages/HealthCareProvider/HealthcarePrescriptionsPage";
import { AmbulanceRequestProvider } from "./context/AmbulanceRequestContext";
import Toast from "./components/toast/Toast";
import { getSocket, connectSocket } from "./hooks/sockets";
import { ErrorBoundary } from "react-error-boundary";
import UserSignupPage from "./pages/UserSignUpPage";
import HealthChatbot from "./components/HealthChatbot";

const queryClient = new QueryClient();

export default function App() {
  const userRole = localStorage.getItem("Role");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      connectSocket();

      // Set up the notification listener for real-time notifications
      socket.on("notification", (newNotification) => {
        let mappedType:
          | "success"
          | "error"
          | "warning"
          | "ambulance-request"
          | "info";

        switch (newNotification.type) {
          case "alert":
            mappedType = "warning";
            break;
          case "ambulance-request":
            mappedType = "ambulance-request";
            break;
          case "error":
            mappedType = "error";
            break;
          case "success":
            mappedType = "success";
            break;
          default:
            mappedType = "info";
        }

        const transformedNotification = {
          _id: newNotification.id,
          type: mappedType,
          title: newNotification.title,
          message: newNotification.content,
          data: {
            timestamp: newNotification.createdAt
              ? new Date(newNotification.createdAt).getTime()
              : Date.now(),
          },
        };

        if (
          (userRole === "PROVIDER" &&
            transformedNotification.type === "ambulance-request") ||
          (userRole === "STUDENT" &&
            transformedNotification.type !== "ambulance-request")
        ) {
          setNotifications((prev) => [transformedNotification, ...prev]);
        }
      });

      socket.on("initialNotifications", (storedNotifications) => {
        console.log("Received initial notifications:", storedNotifications);

        interface StoredNotification {
          id: string;
          userId: string;
          type: string;
          title: string;
          message: string;
          createdAt?: string;
        }

        interface TransformedNotification {
          _id: string;
          type: "alert" | "ambulance-request" | "success" | "error" | "info";
          title: string;
          message: string;
          data: {
            timestamp: number;
          };
        }

        const transformedNotifications: TransformedNotification[] =
          storedNotifications.map((notification: StoredNotification) => {
            let mappedType:
              | "alert"
              | "ambulance-request"
              | "success"
              | "error"
              | "info";

            switch (notification.type) {
              case "alert":
                mappedType =
                  userRole === "PROVIDER" ? "ambulance-request" : "alert";
                break;
              case "ambulance-request":
                mappedType = "ambulance-request";
                break;
              case "error":
                mappedType = "error";
                break;
              case "success":
                mappedType = "success";
                break;
              default:
                mappedType = "info";
            }

            return {
              _id: notification.id,
              type: mappedType,
              title: notification.title,
              message: notification.message,
              data: {
                timestamp: notification.createdAt
                  ? new Date(notification.createdAt).getTime()
                  : Date.now(),
              },
            };
          });

        const filteredNotifications = transformedNotifications.filter(
          (notification) =>
            (userRole === "PROVIDER" &&
              notification.type === "ambulance-request") ||
            (userRole === "STUDENT" && notification.type === "alert")
        );

        setNotifications(filteredNotifications);
      });

      const refreshInterval = setInterval(() => {
        if (socket.connected) {
          console.log("Refreshing notifications");
          socket.emit("getInitialNotifications");
        }
      }, 90000);

      return () => {
        socket.off("notification");
        socket.off("initialNotifications");
        clearInterval(refreshInterval);
      };
    } else {
      console.warn("Socket not initialized. User is not authenticated.");
    }
  }, [userRole]);

  interface Notification {
    _id: string;
    message: string;
  }

  const handleCloseToast = (id: string) => {
    setNotifications((prev: Notification[]) =>
      prev.filter((n) => n._id !== id)
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GlobalStateProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" />
            {/* {userRole === "STUDENT" ? (
              <ErrorBoundary
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <div role="alert">
                    <p>Something went wrong:</p>
                    <pre>{error.message}</pre>
                    <button onClick={resetErrorBoundary}>Try again</button>
                  </div>
                )}
              >
                <HealthChatbot
                  key={userRole}
                  apiKey="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"
                />
              </ErrorBoundary>
            ) : null} */}
            <div className="toast-container">
              {notifications.map((notification) => (
                <Toast
                  key={notification._id}
                  notification={notification}
                  onClose={handleCloseToast}
                />
              ))}
            </div>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />

              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="*" element={<NotFound />} />
              <Route path="/usersignup" element={<UserSignupPage />} />

              {/* Student Pages */}
              <Route
                path="/student/dashboard"
                element={<StudentDashboardPage />}
              />
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route
                path="/student/appointments"
                element={<StudentAppointmentPage />}
              />
              <Route
                path="/student/health-goals"
                element={<StudentHealthGoalsPage />}
              />
              <Route
                path="/student/health-records"
                element={<StudentHealthRecordsPage />}
              />
              <Route
                path="/student/notifications"
                element={<StudentNotificationsPage />}
              />

              {/* Healthcare Pages */}
              <Route
                path="/healthcare-provider/*"
                element={
                  <AmbulanceRequestProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={<HealthcareProviderDashboard />}
                      />
                      <Route
                        path="appointments"
                        element={<AppointmentManagementPage />}
                      />
                      <Route
                        path="patients"
                        element={<PatientManagementPage />}
                      />
                      <Route path="alerts" element={<AlertsPage />} />
                      <Route
                        path="health-records"
                        element={<HealthRecordsPage />}
                      />
                      <Route
                        path="prescriptions"
                        element={<PrescriptionsPage />}
                      />
                      <Route path="Signup" element={<SignupPage />} />
                    </Routes>
                  </AmbulanceRequestProvider>
                }
              />
            </Routes>
          </BrowserRouter>
        </GlobalStateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
