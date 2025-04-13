import { useEffect, useState } from "react";
import axios from "axios";

interface DailyHealthData {
  date: string;
  steps: number;
  waterIntake: number;
  mood?: string;
  journal?: string;
}
import api from "../api";

export function useDailyHealthData(date: Date) {
  const [data, setData] = useState<DailyHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Authentication required");

        const response = await api.get("/api/health/daily", {
          params: {
            date: date.toISOString().split("T")[0],
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return { data, isLoading, error };
}
