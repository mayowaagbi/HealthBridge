import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import api from "../api";

// Define types for our health data
interface HealthData {
  date: string;
  steps: number;
  waterIntake: number;
  mood: string | null;
  journal: string | null;
}

type StudentDetailsModalProps = {
  userId: string; // Add userId as a prop
  onClose: () => void;
};

// Constants for goals
const WATER_GOAL = 2500; // in milliliters
const STEPS_GOAL = 10000;

export function StudentDetailsModal({
  userId,
  onClose,
}: StudentDetailsModalProps) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Fetch health data on component mount and when date or userId changes
  useEffect(() => {
    fetchHealthData();
  }, [selectedDate, userId]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Access token not found.");
      console.log(
        "Fetching health data for userId:",
        userId,
        "and date:",
        selectedDate
      );
      const response = await api.get("/api/health/daily/provider", {
        params: { date: selectedDate, studentId: userId }, // Pass userId as a query parameter
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("response", response.data);
      setHealthData(response.data);
    } catch (error) {
      console.error("Error fetching health data:", error);
      toast.error("Failed to load health data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (loading) {
    return <HealthDashboardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Health Dashboard</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline" size="sm" onClick={fetchHealthData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Water Intake Card */}
          <Card>
            <CardHeader>
              <CardTitle>Water Intake</CardTitle>
              <CardDescription>Your daily hydration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-3xl font-bold">
                    {healthData
                      ? (healthData.waterIntake / 1000).toFixed(1)
                      : "0.0"}
                    L
                  </span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Daily Goal</span>
                    <span className="text-sm font-medium">
                      {healthData
                        ? (healthData.waterIntake / 1000).toFixed(1)
                        : "0.0"}
                      L / {(WATER_GOAL / 1000).toFixed(1)}L
                    </span>
                  </div>
                  <Progress
                    value={
                      healthData
                        ? (healthData.waterIntake / WATER_GOAL) * 100
                        : 0
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Count Card */}
          <Card>
            <CardHeader>
              <CardTitle>Step Count</CardTitle>
              <CardDescription>Your daily activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-3xl font-bold">
                    {healthData ? healthData.steps.toLocaleString() : "0"} steps
                  </span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Daily Goal</span>
                    <span className="text-sm font-medium">
                      {healthData ? healthData.steps.toLocaleString() : "0"} /{" "}
                      {STEPS_GOAL.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      healthData ? (healthData.steps / STEPS_GOAL) * 100 : 0
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Journal Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mood & Journal</CardTitle>
            <CardDescription>
              Your mental wellbeing for{" "}
              {format(new Date(selectedDate), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthData && (healthData.mood || healthData.journal) ? (
              <div className="space-y-4">
                {healthData.mood && (
                  <div>
                    <h3 className="text-md font-semibold mb-2">Today's Mood</h3>
                    <div className="text-4xl">{healthData.mood}</div>
                  </div>
                )}

                {healthData.journal && (
                  <div>
                    <h3 className="text-md font-semibold mb-2">
                      Journal Entry
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p>{healthData.journal}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No mood or journal entry recorded for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// Skeleton loader for the dashboard
function HealthDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Water Intake Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Skeleton className="h-8 w-16" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Count Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Skeleton className="h-8 w-32" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
