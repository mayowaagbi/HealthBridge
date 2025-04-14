import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Heart } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "../../components/ui/input";
import api from "../../api";

interface Appointment {
  id: string;
  studentId: string;
  providerId: string | null;
  supportId: string | null;
  startTime: string;
  duration: number;
  service: string;
  status: string;
  priority: number;
  location: string | null;
  notes: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  student: StudentDetails;
  provider?: ProviderDetails;
}

interface StudentDetails {
  id: string;
  studentId: string;
  profile: Profile;
}

interface Profile {
  firstName: string | null;
  lastName: string | null;
}

interface ProviderDetails {
  id: string;
  profile: Profile;
}

interface CheckInResult {
  success: boolean;
  message: string;
  appointment?: Appointment;
}

const QrCodeScannerPortal: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>("environment");
  const [manualMode, setManualMode] = useState(false);
  const [appointmentIdInput, setAppointmentIdInput] = useState("");
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "No date available";

    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const handleScan = useCallback((decodedText: string) => {
    console.log("QR Code detected:", decodedText);
    setScanning(false);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        decodedText
      )
    ) {
      setError("Invalid appointment QR code");
      return;
    }

    processAppointmentCheckIn(decodedText);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    console.error("QR Scanner error:", errorMessage);
    if (!errorMessage.includes("No QR code found")) {
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning) {
      const container = document.getElementById("scanner-container");
      if (container) {
        container.innerHTML = ""; // Clear previous content

        scanner = new Html5QrcodeScanner(
          "scanner-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.777778,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render((decodedText) => {
          scanner?.clear();
          handleScan(decodedText);
        }, handleError);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanning, handleScan, handleError]);

  const processAppointmentCheckIn = async (appointmentId: string) => {
    setProcessingCheckIn(true);
    try {
      console.log("Processing check-in for appointment:", appointmentId);

      const response = await api.post(
        `/api/appointments/${appointmentId}/check-in`
      );

      setScanResult({
        success: true,
        message: "Check-in successful",
        appointment: response.data.appointment,
      });
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Server error during check-in"
        : err instanceof Error
        ? err.message
        : "Check-in failed";

      setScanResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleManualCheckIn = () => {
    setManualMode(true);
    setSearchResults([]);
    setSelectedAppointment(null);
    setError(null);
  };

  // const handleSearchAppointments = async () => {
  //   if (!appointmentIdInput.trim()) {
  //     setError("Please enter a student ID or appointment ID");
  //     return;
  //   }

  //   setSearching(true);
  //   setError(null);

  //   try {
  //     const accessToken = localStorage.getItem("accessToken");
  //     if (!accessToken) {
  //       throw new Error("Access token not found.");
  //     }

  //     const response = await api.get(
  //       `/api/appointments/search?query=${appointmentIdInput}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     // Fix for error at line 218: Check if response.data and response.data.appointments exist
  //     if (response.data && response.data.appointments) {
  //       setSearchResults(response.data.appointments);

  //       if (response.data.appointments.length === 0) {
  //         setError("No appointments found matching your search");
  //       }
  //     } else {
  //       // Handle case where the response doesn't have the expected structure
  //       setSearchResults([]);
  //       setError("Invalid response from server");
  //       console.error("Invalid API response:", response);
  //     }
  //   } catch (err) {
  //     console.error("Search error:", err);
  //     const errorMessage = axios.isAxiosError(err)
  //       ? err.response?.data?.message || "Error searching appointments"
  //       : err instanceof Error
  //       ? err.message
  //       : "Failed to search appointments";
  //     setError(errorMessage);
  //     setSearchResults([]); // Ensure searchResults is always an array
  //   } finally {
  //     setSearching(false);
  //   }
  // };
  const handleSearchAppointments = async () => {
    if (!appointmentIdInput.trim()) {
      setError("Please enter a student ID or appointment ID");
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found.");
      }

      const response = await api.get(
        `/api/appointments/search?query=${appointmentIdInput}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Fix: The correct data path is response.data.data.appointments
      if (
        response.data &&
        response.data.data &&
        response.data.data.appointments
      ) {
        setSearchResults(response.data.data.appointments);

        if (response.data.data.appointments.length === 0) {
          setError("No appointments found matching your search");
        }
      } else {
        // Handle case where the response doesn't have the expected structure
        setSearchResults([]);
        setError("Invalid response from server");
        console.error("Invalid API response:", response);
      }
    } catch (err) {
      console.error("Search error:", err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Error searching appointments"
        : err instanceof Error
        ? err.message
        : "Failed to search appointments";
      setError(errorMessage);
      setSearchResults([]); // Ensure searchResults is always an array
    } finally {
      setSearching(false);
    }
  };
  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const confirmManualCheckIn = async () => {
    if (!selectedAppointment) return;

    setProcessingCheckIn(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found.");
      }

      const response = await api.patch(
        `/api/appointments/${selectedAppointment.id}/check-in`,
        {}, // Empty payload object for POST
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setScanResult({
        success: true,
        message: "Manual check-in successful",
        appointment: response.data.appointment,
      });
      setManualMode(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Manual check-in error:", err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Server error during check-in"
        : err instanceof Error
        ? err.message
        : "Manual check-in failed";
      setError(errorMessage);
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setScanning(true);
  };

  const startScanner = () => {
    setError(null);
    setScanResult(null);
    setScanning(true);
  };

  const stopScanner = () => {
    setScanning(false);
  };

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
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/healthcare-provider/qrscanner"
          >
            QR Scanner
          </Link>
        </nav>
      </header>

      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Medical Center Check-in
              </CardTitle>
              <CardDescription>
                Scan appointment QR code to check in
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="scan" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-4">
                <CardContent>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Camera
                    </label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="environment">Rear Camera (Default)</option>
                      <option value="user">Front Camera</option>
                    </select>
                  </div>

                  {!scanResult ? (
                    <>
                      <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        {scanning ? (
                          <div
                            id="scanner-container"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="text-center text-gray-500">
                            <p className="mb-2">
                              Camera preview will appear here
                            </p>
                            <p className="text-sm">
                              Click "Start Scanning" to begin
                            </p>
                          </div>
                        )}
                      </div>

                      {error && (
                        <Alert variant="destructive" className="mt-4">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Scanning Error</AlertTitle>
                          <AlertDescription>
                            {error}
                            <div className="mt-2">
                              <Button
                                variant="link"
                                className="h-auto p-0 text-sm"
                                onClick={() => {
                                  setError(null);
                                  startScanner();
                                }}
                              >
                                Try Again
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      {scanResult.success ? (
                        <>
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">
                              Check-in Successful
                            </AlertTitle>
                            <AlertDescription className="text-green-700">
                              {scanResult.message}
                            </AlertDescription>
                          </Alert>

                          {scanResult.appointment && (
                            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">
                                  {scanResult.appointment.service ||
                                    "No service specified"}
                                </h3>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={
                                      scanResult.appointment.checkedIn
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {scanResult.appointment.checkedIn
                                      ? "Checked In"
                                      : "Pending"}
                                  </Badge>
                                  <Badge
                                    variant={
                                      scanResult.appointment.priority > 2
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    Priority: {scanResult.appointment.priority}
                                  </Badge>
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                <p>
                                  Time:{" "}
                                  {formatDateTime(
                                    scanResult.appointment.startTime
                                  )}
                                </p>
                                {scanResult.appointment.provider && (
                                  <p>
                                    Provider:{" "}
                                    {scanResult.appointment.provider.profile
                                      .firstName || "Unknown"}{" "}
                                    {scanResult.appointment.provider.profile
                                      .lastName || ""}
                                  </p>
                                )}
                                {scanResult.appointment.checkedInAt && (
                                  <p>
                                    Checked in at:{" "}
                                    {formatDateTime(
                                      scanResult.appointment.checkedInAt
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Check-in Failed</AlertTitle>
                          <AlertDescription>
                            {scanResult.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-center gap-4">
                  {!scanning && !scanResult && (
                    <Button onClick={startScanner} className="w-full">
                      Start Scanning
                    </Button>
                  )}

                  {scanning && (
                    <Button
                      onClick={stopScanner}
                      variant="outline"
                      className="w-full"
                    >
                      Stop Scanning
                    </Button>
                  )}

                  {scanResult && (
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan Another
                    </Button>
                  )}

                  {processingCheckIn && (
                    <Button disabled className="w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </Button>
                  )}
                </CardFooter>
              </TabsContent>

              <TabsContent value="manual">
                <CardContent>
                  {!manualMode ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <p className="text-center text-gray-500 mb-4">
                        Use manual check-in if the QR code is unavailable
                      </p>
                      <Button onClick={handleManualCheckIn} className="w-full">
                        Enter Appointment Details
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="appointment-search"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Search by Student ID or Appointment ID
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="appointment-search"
                            value={appointmentIdInput}
                            onChange={(e) =>
                              setAppointmentIdInput(e.target.value)
                            }
                            placeholder="Enter student ID or appointment ID"
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSearchAppointments}
                            disabled={searching}
                          >
                            {searching ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Search"
                            )}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {searchResults && searchResults.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Select Appointment</h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((appointment) => (
                              <Card
                                key={appointment.id}
                                className={`cursor-pointer transition-colors ${
                                  selectedAppointment?.id === appointment.id
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                  handleSelectAppointment(appointment)
                                }
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">
                                        {appointment.service ||
                                          "No service specified"}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {appointment.student?.profile
                                          ?.firstName || ""}{" "}
                                        {appointment.student?.profile
                                          ?.lastName || ""}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        appointment.checkedIn
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {appointment.checkedIn
                                        ? "Checked In"
                                        : "Pending"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(appointment.startTime)}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAppointment && (
                        <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              {selectedAppointment.service ||
                                "No service specified"}
                            </h3>
                            <Badge
                              variant={
                                selectedAppointment.checkedIn
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {selectedAppointment.checkedIn
                                ? "Checked In"
                                : "Pending"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>
                              Student:{" "}
                              {selectedAppointment.student?.profile
                                ?.firstName || ""}{" "}
                              {selectedAppointment.student?.profile?.lastName ||
                                ""}
                            </p>
                            <p>
                              Time:{" "}
                              {formatDateTime(selectedAppointment.startTime)}
                            </p>
                            {selectedAppointment.provider && (
                              <p>
                                Provider:{" "}
                                {selectedAppointment.provider.profile
                                  ?.firstName || ""}{" "}
                                {selectedAppointment.provider.profile
                                  ?.lastName || ""}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setManualMode(false);
                            setSelectedAppointment(null);
                            setError(null);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={confirmManualCheckIn}
                          disabled={!selectedAppointment || processingCheckIn}
                          className="flex-1"
                        >
                          {processingCheckIn ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Confirm Check-In
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default QrCodeScannerPortal;
