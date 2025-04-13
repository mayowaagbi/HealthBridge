import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add useNavigate
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Uncomment this line
import { motion } from "framer-motion";
import { toast } from "react-hot-toast"; // Import toast
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import api from "../api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Loader2 } from "lucide-react";

// Define the schema for form validation
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["STUDENT", "HEALTHCARE_PROVIDER", "ADMIN"]),
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Add useNavigate

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema), // Uncomment this line
    defaultValues: {
      email: "",
      password: "",
      role: "STUDENT",
      profile: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phone: "",
      },
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Not authenticated");

      // Format the data to match the backend schema
      const formattedData = {
        ...data,
        profile: {
          ...data.profile,
          dateOfBirth: new Date(data.profile.dateOfBirth).toISOString(), // Ensure date is in ISO format
        },
      };

      console.log("Formatted signup data:", formattedData); // Debugging: Log the formatted data

      const headers = { Authorization: `Bearer ${accessToken}` };
      const response = await api.post("/api/auth/register", formattedData, {
        headers,
      });

      console.log("Signup response:", response.data); // Debugging: Log the response

      // Display success toast
      toast.success("Signup successful!");

      // Redirect to the previous page
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Signup error:", error); // Debugging: Log the error
      const errorMessage =
        (error as any).response?.data?.message ||
        "Failed to sign up. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your account for the Campus Health Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("role", value as SignupFormValues["role"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    {/* Uncomment these if needed */}
                    {/* <SelectItem value="HEALTHCARE_PROVIDER">
                      Healthcare Provider
                    </SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register("profile.firstName")} />
                {form.formState.errors.profile?.firstName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.profile.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form.register("profile.lastName")} />
                {form.formState.errors.profile?.lastName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.profile.lastName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("profile.dateOfBirth")}
                />
                {form.formState.errors.profile?.dateOfBirth && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.profile.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register("profile.phone")} />
                {form.formState.errors.profile?.phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.profile.phone.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
