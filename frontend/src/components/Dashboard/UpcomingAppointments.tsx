import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "../../hooks/use-toast";
import { Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface Appointment {
  id: string;
  service: string;
  startTime: string;
}

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Access token not found.");
        }

        const response = await axios.get(`${API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { t: Date.now() }, // Cache busting parameter
        });

        console.log("Appointments fetched:", response.data);
        setAppointments(response.data.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments.",
          type: "foreground",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [API_URL]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your scheduled health visits</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        ) : appointments.length > 0 ? (
          <ul className="space-y-2">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {appointment.service} - {formatDate(appointment.startTime)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No upcoming appointments
          </p>
        )}
      </CardContent>
    </Card>
  );
}
