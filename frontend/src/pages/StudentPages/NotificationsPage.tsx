import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Bell, Calendar, FileText, Target } from "lucide-react";
import { Heart } from "lucide-react";
export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      message: "Reminder: Dental check-up tomorrow at 10:00 AM",
      read: false,
    },
    {
      id: 2,
      type: "health_record",
      message: "New health record uploaded: Blood Test Results",
      read: false,
    },
    {
      id: 3,
      type: "goal",
      message: "Congratulations! You've reached your daily step goal",
      read: true,
    },
    {
      id: 4,
      type: "campus",
      message: "Campus-wide health advisory: Flu season precautions",
      read: false,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "health_record":
        return <FileText className="h-4 w-4" />;
      case "goal":
        return <Target className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          className="flex items-center justify-center"
          to="/student/dashboard"
        >
          <span className="sr-only">Campus Health Management System</span>
          <Heart className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">CHMS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/appointments"
          >
            Appointments
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/health-records"
          >
            Health Records
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/health-goals"
          >
            Health Goals
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/profile"
          >
            Profile
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Notifications</h1>
          <Card>
            <CardHeader>
              <CardTitle>Your Notifications</CardTitle>
              <CardDescription>
                Stay updated with your health and campus activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg ${
                      notification.read ? "bg-gray-50" : "bg-blue-50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.read ? "bg-gray-200" : "bg-blue-200"
                      }`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <p
                        className={`text-sm ${
                          notification.read
                            ? "text-gray-600"
                            : "text-blue-600 font-medium"
                        }`}
                      >
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
