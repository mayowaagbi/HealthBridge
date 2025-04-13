import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
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
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "../api";
import { Loader2 } from "lucide-react";
import Footer from "../components/Footer";

// Updated schema without role field
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    phone: z
      .string()
      .regex(/^(?:\+?[1-9]\d{1,14}|0\d{7,14})$/, "Invalid phone number"),
  }),
});

// Type without role field
type SignupFormValues = z.infer<typeof signupSchema>;

export default function UserSignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
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

      // Add default role here
      const formattedData = {
        ...data,
        role: "STUDENT", // Hardcoded role
        profile: {
          ...data.profile,
          dateOfBirth: new Date(data.profile.dateOfBirth).toISOString(),
        },
      };

      const headers = { Authorization: `Bearer ${accessToken}` };
      const response = await api.post("/api/auth/register", formattedData, {
        headers,
      });
      navigate("/login");
      toast.success("Signup successful!");
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message ||
        "Failed to sign up. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-black">
        <Link className="flex items-center justify-center" to="/">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Heart className="h-6 w-6 text-primary" />
          </motion.div>
          <motion.span
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="ml-2 text-lg font-bold text-black dark:text-white"
          >
            Campus Health System
          </motion.span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center mb-4 bg-white dark:bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-6 space-y-6 bg-white dark:bg-black "
        >
          <Card className="dark:bg-black">
            <CardHeader>
              <CardTitle className="dark:text-white">Sign Up</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Create your account for the Campus Health Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="dark:text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("profile.firstName")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.profile?.firstName && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.profile.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="dark:text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("profile.lastName")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.profile?.lastName && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.profile.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="dark:text-white">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("profile.dateOfBirth")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.profile?.dateOfBirth && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.profile.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="dark:text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("profile.phone")}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  {form.formState.errors.profile?.phone && (
                    <p className="text-sm text-red-500 dark:text-red-400">
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
              <div className="text-center text-sm mt-4 ">
                <Link to="/login" className="text-primary hover:underline ">
                  Already have an account?
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
