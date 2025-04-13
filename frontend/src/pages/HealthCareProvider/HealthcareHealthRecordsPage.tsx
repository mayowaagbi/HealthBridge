import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import {
  ChevronDown,
  Search,
  FileText,
  Download,
  Eye,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import api from "../../api";
interface HealthRecord {
  id: string;
  filename: string;
  student: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  uploadedAt: string;
  uploadedById: string;
}

export default function HealthRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Not authenticated");

        const headers = { Authorization: `Bearer ${accessToken}` };
        const response = await api.get("/api/documents/all", { headers });

        console.log("API Response:", response.data); // Debugging

        // Ensure records is always an array
        setRecords(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching health records:", error);
        toast.error("Failed to load health records");
        setError("Failed to load health records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Ensure records is an array before filtering
  const filteredRecords = Array.isArray(records)
    ? records.filter((record) =>
        `${record.student?.profile?.firstName || ""} ${
          record.student?.profile?.lastName || ""
        }`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  async function handleDownload(id: string, filename: string): Promise<void> {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Not authenticated");

      const headers = { Authorization: `Bearer ${accessToken}` };
      const response = await api.get(`/api/documents/download/${id}`, {
        headers,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading the record:", error);
      toast.error("Failed to download the record");
    }
  }

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
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Health Records Management</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Search health records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {`${record.student?.profile?.firstName || "Unknown"} ${
                          record.student?.profile?.lastName || ""
                        }`}
                      </TableCell>
                      <TableCell>{record.filename}</TableCell>
                      <TableCell>
                        {new Date(record.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.uploadedById || "Unknown"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Record
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDownload(record.id, record.filename)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Record
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Add Notes
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
        </motion.div>
      </main>
    </div>
  );
}
