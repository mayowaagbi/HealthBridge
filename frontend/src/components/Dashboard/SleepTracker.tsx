import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

interface SleepTrackerProps {
  sleepHours: number;
  sleepGoal: number;
}

export default function SleepTracker({
  sleepHours,
  sleepGoal,
}: SleepTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Tracker</CardTitle>
        <CardDescription>Monitor your sleep patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <span className="text-2xl font-bold">{sleepHours} hours</span>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className="text-sm font-medium">
                {sleepHours} / {sleepGoal} hours
              </span>
            </div>
            <Progress
              value={(sleepHours / sleepGoal) * 100}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
