// src/components/profile/NotificationPreferences.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
interface NotificationPreferencesProps {
  email: boolean;
  sms: boolean;
  push: boolean;
  onChange: (type: "notifyEmail" | "notifySms" | "notifyPush") => void;
}

export default function NotificationPreferences({
  email,
  sms,
  push,
  onChange,
}: NotificationPreferencesProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <Switch
            id="emailNotifications"
            checked={email}
            onCheckedChange={() => onChange("notifyEmail")}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="smsNotifications">SMS Notifications</Label>
          <Switch
            id="smsNotifications"
            checked={sms}
            onCheckedChange={() => onChange("notifySms")}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="pushNotifications">Push Notifications</Label>
          <Switch
            id="pushNotifications"
            checked={push}
            onCheckedChange={() => onChange("notifyPush")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
