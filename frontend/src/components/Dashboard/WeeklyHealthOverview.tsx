import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "../../components/ui/skeleton";
import { useWeeklyHealthData } from "../../hooks/useWeeklyHealthData"; // Custom hook

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; stroke: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-4 rounded-lg shadow-lg border">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.stroke }}
              ></div>
              <span>
                {entry.name}: {entry.value.toLocaleString()}
                {entry.name.includes("Water") && "L"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function WeeklyHealthOverview() {
  const { data, isLoading, error } = useWeeklyHealthData();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading health data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Health Overview</CardTitle>
        <CardDescription>
          Your daily steps, calorie burn, and water intake for the past week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6b7280" }}
                  stroke="#374151"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#6b7280" }}
                  stroke="#374151"
                  label={{
                    value: "Steps",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#6b7280" }}
                  stroke="#374151"
                  label={{
                    value: "Calories / Water (L)",
                    angle: 90,
                    position: "insideRight",
                    fill: "#6b7280",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => (
                    <span className="text-gray-400">{value}</span>
                  )}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="steps"
                  stroke="#8b5cf6" // Purple
                  strokeWidth={2}
                  name="Steps"
                  dot={{ r: 4, fill: "#8b5cf6" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981" // Green
                  strokeWidth={2}
                  name="Calories Burned"
                  dot={{ r: 4, fill: "#10b981" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterIntake"
                  stroke="#3b82f6" // Blue
                  strokeWidth={2}
                  name="Water Intake"
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
