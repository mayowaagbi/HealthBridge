import { useEffect, useState } from "react";
import axios from "axios";

interface HealthData {
  day: string;
  steps: number;
  calories: number;
  waterIntake: number;
}

export function useWeeklyHealthData() {
  const [data, setData] = useState<HealthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Authentication required");

        const response = await axios.get(
          "http://localhost:3000/api/healthdata/weekly",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
