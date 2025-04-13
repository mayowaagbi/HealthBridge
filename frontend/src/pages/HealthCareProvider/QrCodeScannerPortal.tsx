// QrCodeScannerPortal.tsx
import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
// Types based on your Prisma schema
interface Appointment {
  id: string;
  studentId: string;
  providerId: string | null;
  supportId: string | null;
  startTime: Date;
  duration: number;
  service: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "DENIED"
    | "CANCELLED"
    | "RESCHEDULED"
    | "MISSED";
  priority: number;
  location: string | null;
  notes: string | null;
  student: StudentDetails;
  provider?: ProviderDetails;
  support?: SupportDetails;
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

interface SupportDetails {
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
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize QR code scanner
    const qrCodeScanner = new Html5Qrcode("reader");
    setHtml5QrCode(qrCodeScanner);

    // Clean up on component unmount
    return () => {
      if (qrCodeScanner.isScanning) {
        qrCodeScanner.stop().catch((err) => console.error(err));
      }
    };
  }, []);

  const startScanner = () => {
    if (!html5QrCode) return;

    setScanning(true);
    setError(null);
    setScanResult(null);

    const qrCodeSuccessCallback = async (decodedText: string) => {
      // Stop scanning once we have a result
      await html5QrCode?.stop();
      setScanning(false);

      try {
        // Validate the QR code format (should be a UUID)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(decodedText)) {
          throw new Error("Invalid QR code format");
        }

        // Fetch appointment details and process check-in
        processAppointmentCheckIn(decodedText);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    const qrCodeErrorCallback = (error: string) => {
      console.error(error);
      setError("Error accessing camera: " + error);
      setScanning(false);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      )
      .catch((err) => {
        console.error(err);
        setError("Could not start scanner: " + err);
        setScanning(false);
      });
  };

  const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop();
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  const processAppointmentCheckIn = async (appointmentId: string) => {
    setProcessingCheckIn(true);

    try {
      // API call to your backend
      const response = await fetch(
        `/api/appointments/${appointmentId}/check-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check in");
      }

      setScanResult({
        success: true,
        message: "Check-in successful",
        appointment: data.appointment,
      });
    } catch (err) {
      if (err instanceof Error) {
        setScanResult({
          success: false,
          message: err.message,
        });
      } else {
        setScanResult({
          success: false,
          message: "An unknown error occurred",
        });
      }
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const formatAppointmentTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const manualCheckIn = () => {
    // Placeholder for manual check-in functionality
    // This would open a form to enter appointment ID or student ID
    setError("Manual check-in feature not implemented yet");
  };

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          className="flex items-center justify-center"
          to="/healthcare-provider"
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Medical Center Check-in</CardTitle>
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
              {!scanResult ? (
                <>
                  <div
                    id="reader"
                    className="w-full h-64 bg-gray-100 rounded-md overflow-hidden"
                  ></div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
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
                              {scanResult.appointment.student.profile.firstName}{" "}
                              {scanResult.appointment.student.profile.lastName}
                            </h3>
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

                          <div className="text-sm text-gray-500">
                            <p>
                              Student ID:{" "}
                              {scanResult.appointment.student.studentId}
                            </p>
                            <p>
                              Appointment:{" "}
                              {formatAppointmentTime(
                                scanResult.appointment.startTime
                              )}
                            </p>
                            <p>Service: {scanResult.appointment.service}</p>
                            <p>
                              Provider:{" "}
                              {
                                scanResult.appointment.provider?.profile
                                  .firstName
                              }{" "}
                              {
                                scanResult.appointment.provider?.profile
                                  .lastName
                              }
                            </p>
                            {scanResult.appointment.location && (
                              <p>Location: {scanResult.appointment.location}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Check-in Failed</AlertTitle>
                      <AlertDescription>{scanResult.message}</AlertDescription>
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
              <div className="p-8 flex flex-col items-center justify-center">
                <p className="text-center text-gray-500 mb-4">
                  Use manual check-in if the QR code is unavailable
                </p>
                <Button onClick={manualCheckIn} className="w-full">
                  Enter Appointment Details
                </Button>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default QrCodeScannerPortal;
function disconnectSocket() {
  throw new Error("Function not implemented.");
}
