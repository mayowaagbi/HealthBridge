import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import api from "../api";

interface StudentDetails {
  id: string;
  profileId: string;
  studentId: string;
  insuranceNumber: string | null;
  primaryCareProviderId: string | null;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    bloodType?: string;
    allergies?: string;
    emergencyContacts: Array<{
      id: string;
      name: string;
      phone: string;
      relationship?: string;
    }>;
  };
}

interface StudentDetailsModalProps {
  userId: string;
  onClose: () => void;
}

export function ProfileModal({ userId, onClose }: StudentDetailsModalProps) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Access token not found.");
        const response = await api.get<StudentDetails>(
          `/api/profile/${userId}/profile`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setStudentDetails(response.data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch profile details");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div className="text-center">Loading profile...</div>;
  if (!studentDetails)
    return <div className="text-center">Profile not found</div>;

  // Destructure the nested profile data
  const { profile } = studentDetails;
  const {
    firstName,
    lastName,
    phone,
    bloodType,
    allergies,
    emergencyContacts,
  } = profile;

  // Ensure `emergencyContacts` is always an array
  const safeEmergencyContacts = emergencyContacts || [];

  return (
    <Dialog open={!!userId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Profile Details</DialogTitle>
          <DialogDescription>
            View the profile information of the selected student.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic details about the student.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  Who should we contact in case of emergency?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {safeEmergencyContacts.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No emergency contacts found.
                  </div>
                ) : (
                  safeEmergencyContacts.map((contact, index) => (
                    <div
                      key={contact.id} // Use contact.id as the key
                      className="space-y-4 border-b pb-4 last:border-0"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={contact.name}
                          readOnly
                          className="bg-muted/50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>Phone</Label>
                        <Input
                          id={`phone-${index}`}
                          value={contact.phone}
                          readOnly
                          className="bg-muted/50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`relation-${index}`}>Relation</Label>
                        <Input
                          id={`relation-${index}`}
                          value={contact.relationship || "N/A"}
                          readOnly
                          className="bg-muted/50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Important health details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    value={bloodType || "N/A"}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={allergies || "N/A"}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
