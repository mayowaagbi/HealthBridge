import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { toast } from "react-hot-toast";
import api from "../../api";
import { Button } from "../../components/ui/button";

interface StepCountProps {
  initialStepCount?: number;
  initialStepGoal?: number;
}

interface Position {
  latitude: number;
  longitude: number;
}

// Custom hook for geolocation tracking with improved accuracy
const useGeolocationTracker = (accessToken: string) => {
  const [lastSentPosition, setLastSentPosition] = useState<Position | null>(
    null
  );
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [movementCount, setMovementCount] = useState(0);
  const [positionHistory, setPositionHistory] = useState<Position[]>([]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (pos1: Position, pos2: Position) => {
    const R = 6371e3;
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter out noise and detect significant movement
  const isSignificantMovement = (newPosition: Position): boolean => {
    if (!lastSentPosition) return true;

    // Use a higher threshold to filter out GPS jitter
    const distance = calculateDistance(lastSentPosition, newPosition);
    return distance >= 30; // At least 30 meters of movement
  };

  const handleGeolocationError = (error: GeolocationPositionError) => {
    let errorMessage = "Geolocation error: ";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += "Permission denied. Please enable location services.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += "Location information unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage += "Location request timed out. Trying again...";
        break;
      default:
        errorMessage += "Unknown error occurred.";
    }
    console.error(errorMessage);
    setGeolocationError(errorMessage);
    toast.error(errorMessage);
  };

  const trackPosition = async (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;

    // Skip positions with poor accuracy
    // if (accuracy > 50) {
    //   console.log(`Ignoring position with poor accuracy: ${accuracy}m`);
    //   return;
    // }

    const newPosition = { latitude, longitude };

    // Save to history for analysis
    setPositionHistory((prev) => [...prev.slice(-5), newPosition]);

    // Check if this is significant movement
    if (isSignificantMovement(newPosition)) {
      try {
        console.log(
          `Sending position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );

        const payload = { lat: latitude, lng: longitude };

        const response = await api.post("/api/geo/track", payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        });

        console.log("Position successfully sent:", response.data);
        setLastSentPosition(newPosition);
        setMovementCount((prev) => prev + 1);
        setGeolocationError(null);
      } catch (error) {
        console.error("Error sending position:", error);

        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.error || error.message;
          toast.error(`Failed to update location: ${errorMessage}`);
        }
      }
    } else {
      console.log("Movement too small, ignoring");
    }
  };

  useEffect(() => {
    if (!accessToken || !navigator.geolocation) {
      setGeolocationError("Geolocation not supported or no access token");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 15000, // Accept positions up to 15 seconds old
      timeout: 20000, // Allow 20 seconds for position acquisition
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setIsTracking(true);
        trackPosition(position).catch(console.error);
      },
      (error) => {
        setIsTracking(false);
        handleGeolocationError(error);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [accessToken, lastSentPosition]);

  return { isTracking, geolocationError, movementCount };
};

export default function StepCount({
  initialStepCount,
  initialStepGoal,
}: StepCountProps) {
  const accessToken = localStorage.getItem("accessToken");
  const { isTracking, geolocationError, movementCount } = useGeolocationTracker(
    accessToken || ""
  );
  const [stepData, setStepData] = useState({
    stepCount: initialStepCount || 0,
    stepGoal: initialStepGoal || 10000,
    stepProgress: 0,
  });
  const [loading, setLoading] = useState(!initialStepCount);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Function to fetch step data
  const fetchStepData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/api/geo/progress", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data && response.data.data) {
        const newStepCount = response.data.data.current || 0;
        const REASONABLE_MAX_STEPS = 50000; // Most active people won't exceed 50k steps/day

        if (newStepCount > REASONABLE_MAX_STEPS) {
          console.warn("Unusually high step count detected:", newStepCount);
          toast("Unusually high step count detected. Consider resetting.", {
            icon: "⚠️",
          });
        }

        setStepData({
          stepCount: newStepCount,
          stepGoal: response.data.data.target || 10000,
          stepProgress: response.data.data.progress || 0,
        });
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching step data:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to get step data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Function to reset step count
  const resetStepCount = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      await api.post(
        "/api/geo/reset",
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success("Step counter has been reset");
      await fetchStepData();
    } catch (error) {
      console.error("Error resetting step count:", error);
      toast.error("Failed to reset step counter");
      setLoading(false);
    }
  };

  // Fetch step data periodically
  useEffect(() => {
    fetchStepData();

    const handleFetch = () => {
      const now = Date.now();
      if (now - lastFetchTime < 15000 && !loading) {
        return;
      }
      setLastFetchTime(now);
      fetchStepData();
    };

    const intervalId = setInterval(handleFetch, 60000);
    return () => clearInterval(intervalId);
  }, [fetchStepData, lastFetchTime, loading]);

  // Fetch when significant movement is detected
  useEffect(() => {
    if (movementCount > 0) {
      const now = Date.now();
      if (now - lastFetchTime > 10000) {
        setLastFetchTime(now);
        fetchStepData();
      }
    }
  }, [movementCount, fetchStepData, lastFetchTime]);

  const { stepCount, stepGoal, stepProgress } = stepData;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step Count</CardTitle>
          <CardDescription>Loading step data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step Count</CardTitle>
        <CardDescription>
          Your daily activity
          {geolocationError && (
            <span className="text-xs text-red-500 ml-2">
              (Location tracking issue)
            </span>
          )}
          {isTracking && !geolocationError && (
            <span className="text-xs text-green-500 ml-2">
              (Tracking active)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {stepCount > 50000 ? "⚠️ " : ""}
              {stepCount.toLocaleString()} steps
            </span>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className="text-sm font-medium">
                {stepCount.toLocaleString()} / {stepGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={stepProgress} className="w-full" />
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={resetStepCount}
          className="text-sm"
        >
          Reset Counter
        </Button>
      </CardFooter> */}
    </Card>
  );
}
