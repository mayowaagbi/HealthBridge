// src/pages/StudentPages/StudentProfilePage.tsx
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import PersonalInformation from "./components/profile/PersonalInformation";
import EmergencyContact from "./components/profile/EmergencyContact";
import MedicalInformation from "./components/profile/MedicalInformation";
import NotificationPreferences from "./components/profile/NotificationPreferences";
import api from "../../api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Heart } from "lucide-react";
interface EmergencyContactType {
  id?: string;
  name: string;
  phone: string;
  relation?: string;
}

interface User {
  email: string;
}

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyPush: boolean;
  emergencyContacts: EmergencyContactType[];
  user: User;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Access token not found.");
        }
        const response = await api.get<Profile>(
          "http://localhost:3000/api/profile",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = response.data;
        console.log(data);
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.user.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth,
          bloodType: data.bloodType || "",
          allergies: data.allergies || "",
          notifyEmail: data.notifyEmail ?? true,
          notifySms: data.notifySms ?? false,
          notifyPush: data.notifyPush ?? true,
          emergencyContacts:
            data.emergencyContacts?.length > 0
              ? data.emergencyContacts
              : [{ name: "", phone: "" }],
          user: data.user,
        });
        setOriginalProfile({ ...data });
      } catch (error) {
        handleError(error, "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setOriginalProfile(profile);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfile(originalProfile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const payload = {
        ...profile,
        emergencyContacts: profile.emergencyContacts
          .filter((ec) => ec.name && ec.phone) // Filter out empty contacts
          .map((ec) => ({
            id: ec.id || null, // Include ID if it exists
            name: ec.name,
            phone: ec.phone,
            relationship: ec.relation || "Unknown", // Ensure a default value
          })),
      };

      console.log("Sending payload:", payload);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found.");
      }
      const response = await axios.put<Profile>(
        "http://localhost:3000/api/profile",
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setProfile(response.data);
      setOriginalProfile(response.data);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error) {
      handleError(error, "Failed to update profile");
    }
  };
  const handleError = (error: unknown, defaultMessage: string) => {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : error instanceof Error
      ? error.message
      : defaultMessage;

    toast({ title: "Error", description: message, variant: "destructive" });
  };

  const updateProfileField = (field: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...field } : null));
  };

  const updateEmergencyContact = (
    index: number,
    field: "name" | "phone" | "relationship",
    value: string
  ) => {
    setProfile((prev) => {
      if (!prev) return null;
      const contacts = [...prev.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
  };

  const addEmergencyContact = () => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            emergencyContacts: [
              ...prev.emergencyContacts,
              { name: "", phone: "" },
            ],
          }
        : null
    );
  };

  const removeEmergencyContact = (index: number) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            emergencyContacts: prev.emergencyContacts.filter(
              (_, i) => i !== index
            ),
          }
        : null
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="p-4 text-center">Profile not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          className="flex items-center justify-center"
          to="/student/dashboard"
        >
          <span className="sr-only">Campus Health Management System</span>
          <Heart className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">CHMS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/appointments"
          >
            Appointments
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/health-records"
          >
            Health Records
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/health-goals"
          >
            Health Goals
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/notifications"
          >
            Notifications
          </Link>
        </nav>
      </header>

      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4 md:px-6">
          <motion.div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Your Profile</h1>
              {!isEditing ? (
                <Button onClick={handleEditToggle}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" form="profile-form">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <form id="profile-form" onSubmit={handleSubmit}>
              <PersonalInformation
                firstName={profile.firstName}
                lastName={profile.lastName}
                email={profile.email}
                phone={profile.phone}
                dateOfBirth={profile.dateOfBirth}
                isEditing={isEditing}
                onChange={(field, value) =>
                  updateProfileField({ [field]: value })
                }
              />

              <EmergencyContact
                contacts={profile.emergencyContacts}
                isEditing={isEditing}
                onChange={updateEmergencyContact}
                onAdd={addEmergencyContact}
                onRemove={removeEmergencyContact}
              />

              <MedicalInformation
                bloodType={profile.bloodType || ""}
                allergies={profile.allergies || ""}
                isEditing={isEditing}
                onChange={(field, value) =>
                  updateProfileField({ [field]: value })
                }
              />

              <NotificationPreferences
                email={profile.notifyEmail}
                sms={profile.notifySms}
                push={profile.notifyPush}
                // isEditing={isEditing}
                onChange={(type) =>
                  updateProfileField({ [type]: !profile[type] })
                }
              />
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
