// src/components/CurrentGoals.jsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Progress } from "./ui/progress";

// Minimum recommended values (should match backend)
const MIN_STEPS = 5000;
const MIN_WATER_ML = 1500;

interface Goal {
  name: string;
  current: number;
  target: number;
  progress: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface WaterGoal {
  current: number;
  target: number;
  progress: number;
}

interface StepGoal {
  current: number;
  target: number;
  progress: number;
}

export default function CurrentGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleApiError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    setError(message);
    console.error("API Error:", error);
  };

  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const getSafeNumber = (value: unknown, fallback: number): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchGoals = async () => {
      try {
        const [waterRes, stepsRes] = await Promise.allSettled([
          fetchWithAuth("http://localhost:3000/api/water/progress"),
          fetchWithAuth("http://localhost:3000/api/geo/progress"), // Fixed endpoint
        ]);

        // Handle water data
        const waterData: ApiResponse<WaterGoal> =
          (waterRes.status === "fulfilled" && waterRes.value) || {};

        const waterGoal = waterData.data || {
          current: 0,
          target: MIN_WATER_ML,
          progress: 0,
        };

        // Handle step data
        const stepsData: ApiResponse<StepGoal> =
          (stepsRes.status === "fulfilled" && stepsRes.value) || {};

        const stepGoal = stepsData.data || {
          current: 0,
          target: MIN_STEPS,
          progress: 0,
        };

        // Static sleep data
        const sleepGoal: Goal = {
          name: "Sleep Hours",
          current: 7,
          target: 8,
          progress: 87.5,
        };

        setGoals([
          {
            name: "Daily Steps",
            current: getSafeNumber(stepGoal.current, 0),
            target: getSafeNumber(stepGoal.target, MIN_STEPS),
            progress: getSafeNumber(stepGoal.progress, 0),
          },
          {
            name: "Water Intake (L)",
            current: getSafeNumber(waterGoal.current, 0) / 1000,
            target: getSafeNumber(waterGoal.target, MIN_WATER_ML) / 1000,
            progress: getSafeNumber(waterGoal.progress, 0),
          },
          sleepGoal,
        ]);
      } catch (err) {
        handleApiError(err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchGoals();
    return () => controller.abort();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading goals...</div>;

  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        Error loading goals: {error}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Goals</CardTitle>
        <CardDescription>
          Track your progress toward your set goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm font-medium">
                  {goal.current.toFixed(1)} / {goal.target.toFixed(1)}
                </span>
              </div>
              <Progress
                value={Math.min(Math.max(goal.progress, 0), 100)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
