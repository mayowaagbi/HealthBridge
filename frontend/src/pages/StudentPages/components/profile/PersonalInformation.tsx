// src/components/Profile/PersonalInformation.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "../../../../lib/utils";

interface PersonalInformationProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  onChange: (field: string, value: string) => void;
  isEditing: boolean;
}

export default function PersonalInformation({
  firstName = "",
  lastName = "",
  email = "",
  phone = "",
  dateOfBirth = "",
  onChange,
  isEditing,
}: PersonalInformationProps) {
  const formattedDate = dateOfBirth
    ? format(new Date(dateOfBirth), "yyyy-MM-dd")
    : "";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              readOnly={!isEditing}
              className={cn(
                !isEditing && "bg-muted/50 cursor-not-allowed",
                "transition-colors"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              readOnly={!isEditing}
              className={cn(
                !isEditing && "bg-muted/50 cursor-not-allowed",
                "transition-colors"
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            readOnly={true}
            className={cn(
              "bg-muted/50 cursor-not-allowed",
              "transition-colors"
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            readOnly={!isEditing}
            className={cn(
              !isEditing && "bg-muted/50 cursor-not-allowed",
              "transition-colors"
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative">
            <Input
              id="dateOfBirth"
              type="date"
              value={formattedDate}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
              readOnly={!isEditing}
              className={cn(
                !isEditing && "bg-muted/50 cursor-not-allowed",
                "transition-colors"
              )}
            />
            {!isEditing && (
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
