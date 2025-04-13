import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Bell } from "lucide-react";

export default function HealthAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Alerts</CardTitle>
        <CardDescription>Your recent health notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center text-yellow-600">
            <Bell className="mr-2 h-4 w-4" /> Flu shot reminder
          </li>
          <li className="flex items-center text-green-600">
            <Bell className="mr-2 h-4 w-4" /> Health check-up completed
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
