import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ChevronDown, Search, Edit, Trash2, Send, Heart } from "lucide-react";
import { CreateHealthAlertDialog } from "../../components/CreateHealthAlertDialog";
// import { CreateNotificationDialog } from "../../components/CreateNotificationDialog";
import { useToast } from "../../hooks/use-toast";
import api from "../../api";

interface HealthAlert {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  startTime: string;
  endTime: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED";
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    // Fetch initial data
    fetchAlerts();
    // fetchNotifications();

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for alert updates
      socket.on("alert-update", (updatedAlert: HealthAlert) => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === updatedAlert.id ? updatedAlert : alert
          )
        );
      });

      // Listen for new alerts
      socket.on("new-alert", (newAlert: HealthAlert) => {
        setAlerts((prev) => [newAlert, ...prev]);
      });

      // Listen for new notifications
      socket.on("new-notification", (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      });
    }
  }, [socket]);

  const fetchAlerts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");
      const response = await api.get("/api/alerts", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAlerts(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching alerts",
        description: "Failed to load health alerts",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");
      const response = await api.get("/api/notifications", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNotifications(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching notifications",
        description: "Failed to load notifications",
      });
    }
  };

  const handleCreateAlert = async (alertData: {
    title: string;
    content: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    duration: number;
  }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Not authenticated");

      const headers = { Authorization: `Bearer ${accessToken}` };

      const durationInSeconds = alertData.duration * 60 * 60;

      const response = await api.post(
        "/api/alerts/",
        {
          ...alertData,
          duration: durationInSeconds,
          priority: alertData.priority,
          message: alertData.content,
        },
        { headers }
      );

      setAlerts((prev) => [response.data, ...prev]);
      toast({
        title: "Alert Created",
        description: "New health alert has been published",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating alert",
        description: "Failed to create new health alert",
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");
      await api.delete(`api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast({
        title: "Alert Deleted",
        description: "Health alert has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting alert",
        description: "Failed to delete health alert",
      });
    }
  };

  const handleSendAlert = async (alertId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");
      const response = await api.patch(`/alerts/${alertId}/publish`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? response.data : alert))
      );
      toast({
        title: "Alert Published",
        description: "Health alert has been sent to all students",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error publishing alert",
        description: "Failed to publish health alert",
      });
    }
  };

  const updateAlertStatus = async (
    alertId: string,
    status: "DRAFT" | "ACTIVE" | "EXPIRED"
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");

      const response = await api.patch(
        `/api/alerts/${alertId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating alert status:", error);
      throw new Error("Failed to update alert status");
    }
  };

  const checkAndUpdateExpiredAlerts = async () => {
    console.log("Checking for expired alerts..."); // Debugging

    const updatedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        if (
          alert.status !== "EXPIRED" &&
          new Date(alert.endTime) < new Date()
        ) {
          try {
            console.log("Expired alert found:", alert.id); // Debugging
            const updatedAlert = await updateAlertStatus(alert.id, "EXPIRED");
            return updatedAlert; // Use the updated alert from the backend
          } catch (error) {
            console.error("Failed to update alert status:", error);
            return alert; // Return the original alert if the update fails
          }
        }
        return alert; // Return the original alert if it's not expired
      })
    );

    console.log("Updated alerts:", updatedAlerts); // Debugging
    setAlerts(updatedAlerts);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateExpiredAlerts();
    }, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [alerts]);

  const CountdownTimer = ({
    endTime,
    status,
  }: {
    endTime: string;
    status: string;
  }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      const calculateTimeLeft = () => {
        if (status === "EXPIRED") return "Expired";

        const difference = new Date(endTime).getTime() - new Date().getTime();
        if (difference <= 0) return "Expired";

        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        return `${hours}h ${minutes}m left`;
      };

      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000);

      return () => clearInterval(timer);
    }, [endTime, status]);

    return <span>{timeLeft}</span>;
  };
  const handleCreateNotification = async (notificationData: {
    title: string;
    content: string;
    userId: string;
  }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");

      const response = await api.post("/api/notifications", notificationData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setNotifications((prev) => [response.data, ...prev]);
      toast({
        title: "Notification Sent",
        description: "Notification has been sent to the user",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating notification",
        description: "Failed to send notification",
      });
    }
  };
  console.log("Alerts Data:", alerts);

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header and Navigation */}
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          className="flex items-center justify-center"
          to="/healthcare-provider/dashboard"
        >
          <span className="sr-only">
            Campus Health Management System - Healthcare Provider
          </span>
          <Heart className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">CHMS Provider</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/patients"
          >
            Patients
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/appointments"
          >
            Appointments
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/health-records"
          >
            Health Records
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/prescriptions"
          >
            Prescriptions
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/alerts"
          >
            Alerts
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Health Alerts Management</h1>

          {/* Alerts Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Health Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <CreateHealthAlertDialog
                  onCreate={({ title, message, severity, duration }) => {
                    handleCreateAlert({
                      title,
                      content: message,
                      priority: severity,
                      duration,
                    });
                  }}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.title}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded ${
                            alert.priority === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : alert.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {alert.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded ${
                            alert.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-800"
                              : alert.status === "EXPIRED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {alert.status === "ACTIVE" ? (
                          <CountdownTimer
                            endTime={alert.endTime}
                            status={alert.status}
                          />
                        ) : (
                          "Expired"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {alert.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() => handleSendAlert(alert.id)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Publish Alert
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Alert
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteAlert(alert.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Alert
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          {/* <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Send Notifications to Users</span>
                </div>
                <CreateNotificationDialog onCreate={handleCreateNotification} />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.title}</TableCell>
                      <TableCell>{notification.content}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded ${
                            notification.read
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card> */}
        </motion.div>
      </main>
    </div>
  );
}
