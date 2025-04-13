import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import { AppointmentHistoryTable } from "../../components/AppointmentHistoryTable";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ChevronDown, Search, CheckCircle, XCircle, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "../../components/ui/badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";

type Appointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: "PENDING" | "CONFIRMED" | "DENIED" | "COMPLETED" | "RESCHEDULED";
  location?: "Amphithereter" | "BUTH";
  support?: {
    id: string;
    name: string;
  };
  student: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  startTime: string;
};

type Support = {
  id: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
};

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supportSearch, setSupportSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch appointment history
  const fetchAppointmentHistory = async (appointmentId: string) => {
    try {
      setLoadingHistory(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const response = await api.get(
        `/api/appointments/${appointmentId}/history`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setAppointmentHistory(response.data);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      toast.error("Failed to load appointment history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Not authenticated");

        const headers = { Authorization: `Bearer ${accessToken}` };

        const [supportsRes, apptsRes] = await Promise.all([
          api.get("/api/supports", { headers }),
          api.get("/api/appointments/all", { headers }),
        ]);

        // Process supports data
        const supportsData = (supportsRes.data.data || supportsRes.data).map(
          (support: any) => ({
            ...support,
            name: `${support.profile?.firstName || ""} ${
              support.profile?.lastName || ""
            }`.trim(),
          })
        );

        // Process appointments data
        const appointmentsData = (apptsRes.data.data || apptsRes.data).map(
          (appt: any) => ({
            ...appt,
            patientName: `${appt.student?.profile?.firstName || ""} ${
              appt.student?.profile?.lastName || ""
            }`.trim(),
            date: new Date(appt.startTime).toLocaleDateString(),
            time: new Date(appt.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: appt.service,
            support: appt.support
              ? {
                  ...appt.support,
                  name: `${appt.support.profile?.firstName || ""} ${
                    appt.support.profile?.lastName || ""
                  }`.trim(),
                }
              : null,
          })
        );

        if (!Array.isArray(appointmentsData))
          throw new Error("Invalid appointments format");
        if (!Array.isArray(supportsData))
          throw new Error("Invalid supports format");

        setAppointments(appointmentsData);
        setSupports(supportsData);
      } catch (error) {
        console.error("Data loading error:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) window.location.href = "/login";
          setError(error.response?.data?.message || error.message);
        } else {
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        }
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredAppointments = appointments.filter((appt) =>
    appt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingAppointments = filteredAppointments.filter(
    (appt) => appt.status === "PENDING" || appt.status === "RESCHEDULED"
  );

  const confirmedAppointments = filteredAppointments.filter(
    (appt) =>
      appt.status === "CONFIRMED" ||
      appt.status === "COMPLETED" ||
      appt.status === "DENIED"
  );

  const handleStatusUpdate = async (
    id: string,
    status: "CONFIRMED" | "DENIED"
  ) => {
    try {
      console.log(status);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      await api.patch(
        `/api/appointments/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status } : appt))
      );
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Update failed");
    }
  };
  const handleLocationChange = async (
    id: string,
    location: "Amphithereter" | "BUTH"
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      // Update the location in the backend (if needed)
      await api.patch(
        `/api/appointments/${id}/location`,
        { location },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Update the state
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, location } : appt))
      );
      toast.success("Location updated");
    } catch (error) {
      console.error("Location update error:", error);
      toast.error("Failed to update location");
    }
  };
  const handleAssignSupport = async (id: string, supportId: string) => {
    try {
      console.log("Assigning support", id, supportId);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const response = await api.patch(
        `/api/appointments/${id}/assign-support`,
        { supportId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id
            ? {
                ...appt,
                support: response.data.support
                  ? {
                      ...response.data.support,
                      name: `${
                        response.data.support.profile?.firstName || ""
                      } ${
                        response.data.support.profile?.lastName || ""
                      }`.trim(),
                    }
                  : null,
              }
            : appt
        )
      );
      toast.success("Support assigned");
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Assignment failed");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen">
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
            Ambulance
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/alerts"
          >
            Alerts
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Appointment Management</h1>
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Pending Appointments Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Pending Appointments ({pendingAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Support</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>
                        <div>{appointment.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.time}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {appointment.location || "Select Location"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleLocationChange(
                                  appointment.id,
                                  "Amphithereter"
                                )
                              }
                            >
                              Amphitherete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleLocationChange(appointment.id, "BUTH")
                              }
                            >
                              Buth
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{appointment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {appointment.support?.name || "Assign Support"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <div className="p-2">
                              <Input
                                placeholder="Search supports..."
                                value={supportSearch}
                                onChange={(e) =>
                                  setSupportSearch(e.target.value)
                                }
                                className="h-8"
                              />
                            </div>
                            <DropdownMenuSeparator />
                            {supports
                              .filter((s) =>
                                s.name
                                  ?.toLowerCase()
                                  .includes(supportSearch.toLowerCase())
                              )
                              .map((support) => (
                                <DropdownMenuItem
                                  key={support.id}
                                  onSelect={() =>
                                    handleAssignSupport(
                                      appointment.id,
                                      support.id
                                    )
                                  }
                                >
                                  {support.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "CONFIRMED")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "DENIED")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Deny
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pendingAppointments.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No pending appointments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Confirmed Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Confirmed Appointments ({confirmedAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>
                        <div>{appointment.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.time}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "CONFIRMED"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.support?.name || (
                          <span className="text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!confirmedAppointments.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No confirmed appointments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <LoadingSpinner />
              ) : (
                <AppointmentHistoryTable history={appointmentHistory} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
