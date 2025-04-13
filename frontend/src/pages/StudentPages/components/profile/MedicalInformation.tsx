// src/components/Profile/MedicalInformation.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { cn } from "../../../../lib/utils";
interface MedicalInformationProps {
  bloodType?: string;
  allergies?: string;
  onChange: (field: "bloodType" | "allergies", value: string) => void;
  isEditing: boolean;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function MedicalInformation({
  bloodType = "",
  allergies = "",
  onChange,
  isEditing,
}: MedicalInformationProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Medical Information</CardTitle>
        <CardDescription>Important health details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            value={bloodType}
            onValueChange={(value) => onChange("bloodType", value)}
            disabled={!isEditing}
          >
            <SelectTrigger
              className={cn(
                !isEditing && "bg-muted/50 cursor-not-allowed",
                "transition-colors"
              )}
            >
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Input
            id="allergies"
            value={allergies}
            onChange={(e) => onChange("allergies", e.target.value)}
            readOnly={!isEditing}
            className={cn(
              !isEditing && "bg-muted/50 cursor-not-allowed",
              "transition-colors"
            )}
            placeholder="List any allergies"
          />
        </div>
      </CardContent>
    </Card>
  );
}
