import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import axios from "axios";
import { Loader2 } from "lucide-react";
import api from "../../api";
import { toast } from "react-hot-toast";

export default function AmbulanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const COOLDOWN_DURATION = 10 * 60 * 1000;
  const MAX_RETRIES = 2; // Reduced to show manual input sooner

  const getLocation = async (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });
  };

  const startCooldown = () => {
    setCooldown(true);
    setCooldownTime(COOLDOWN_DURATION);
    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          setCooldown(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  const submitRequest = async (latitude?: number, longitude?: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await api.post(
        "/api/ambulance-requests",
        {
          latitude,
          longitude,
          address: manualAddress || undefined,
          details: locationDetails,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Ambulance successfully requested!");
      console.log("Ambulance request sent successfully!", response.data);
      startCooldown();
    } catch (error) {
      console.error("Error requesting ambulance:", error);
      setError(
        (axios.isAxiosError(error) && error.response?.data?.error) ||
          (error instanceof Error && error.message) ||
          "Failed to request ambulance."
      );
      throw error;
    }
  };

  const handleRequestAmbulance = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setShowManualAddress(false);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      let position: GeolocationPosition | null = null;
      let attempts = 0;

      while (!position && attempts < MAX_RETRIES) {
        try {
          position = await getLocation();
          break;
        } catch (locationError) {
          attempts++;
          setRetryCount(attempts);

          if (attempts >= MAX_RETRIES) {
            setShowManualAddress(true);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!position) {
        setShowManualAddress(true);
        return;
      }

      await submitRequest(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      handleLocationError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualAddress.trim()) {
      setError("Please enter a valid address");
      return;
    }

    setLoading(true);
    try {
      await submitRequest();
    } catch (error) {
      console.error("Error submitting manual request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationError = (error: unknown) => {
    console.error("Location error:", error);

    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError("Location access denied. Please enable location services.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          setError("Location request timed out. Please try again.");
          break;
        default:
          setError("Failed to retrieve your location.");
      }
    } else {
      setError(
        (error instanceof Error && error.message) ||
          "Failed to request ambulance."
      );
    }
  };

  const formatCooldownTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Ambulance Request</CardTitle>
        <CardDescription>
          In case of emergency, click below to send your location to dispatch an
          ambulance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showManualAddress ? (
          <>
            <Button
              variant="destructive"
              onClick={handleRequestAmbulance}
              disabled={loading || cooldown}
              className={`w-full ${
                loading || cooldown ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {retryCount > 0
                    ? `Retrying (${retryCount}/${MAX_RETRIES})...`
                    : "Requesting Assistance..."}
                </>
              ) : cooldown ? (
                `Please wait (${formatCooldownTime(cooldownTime)})`
              ) : (
                "Request Emergency Ambulance"
              )}
            </Button>

            {error && (
              <div className="text-red-500 text-sm mt-2">Error: {error}</div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Your Address
              </label>
              <Input
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Street, City, Postal Code"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Additional Location Details (Optional)
              </label>
              <Input
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Apartment number, landmarks, etc."
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManualAddress(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleManualSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>• Your location will be shared with emergency services</p>
          <p>• Keep your phone accessible for follow-up communication</p>
        </div>
      </CardContent>
    </Card>
  );
}
