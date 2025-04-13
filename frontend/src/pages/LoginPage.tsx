import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import Footer from "../components/Footer";
import { Heart, Eye, EyeOff } from "lucide-react";
import { registerSocket } from "../hooks/sockets";

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Define the type for the decoded token
interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

// Type inference from schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        data,
        {
          withCredentials: true, // Ensure cookies are included in requests
        }
      );

      // Get accessToken from the response body
      console.log("Response from login:", response.data);
      const user = response.data.data.user;

      if (!user || !user.token || !user.token.accessToken) {
        console.error("User or token data missing:", response.data);
        throw new Error("Access token not found in response.");
      }

      const accessToken = response.data.data.user.token.accessToken;
      console.log("Access token from response:", accessToken);

      if (!accessToken) {
        throw new Error("Access token not found in response.");
      }

      // Store accessToken in localStorage or memory
      localStorage.setItem("accessToken", accessToken);

      // Decode token to get user role
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      console.log("Decoded Token:", decodedToken);
      console.log("User role:", decodedToken.role);
      localStorage.setItem("Role", decodedToken.role);

      // Initialize the socket connection
      registerSocket(
        decodedToken.role as "STUDENT" | "PROVIDER",
        decodedToken.id
      );

      // Handle student-specific logic
      if (decodedToken.role === "STUDENT") {
        try {
          const studentDetailsResponse = await axios.get(
            `http://localhost:3000/api/student/users/${user.id}/student-details`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const studentDetailsId = studentDetailsResponse.data.id;

          // Store the studentDetailsId in localStorage
          if (studentDetailsId) {
            localStorage.setItem("studentDetailsId", studentDetailsId);
          }
        } catch (error) {
          console.error("Error fetching student details:", error);
          // Handle the error gracefully (e.g., log it or show a message to the user)
        }
      }

      // Handle provider-specific logic
      if (decodedToken.role === "PROVIDER") {
        registerSocket("PROVIDER", decodedToken.id);
      }

      // Redirect based on role
      switch (decodedToken.role) {
        case "STUDENT":
          navigate("/student/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "PROVIDER":
          navigate("/healthcare-provider/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }

      // Show success toast
      console.log("Login successful! Showing toast...");
      toast.success("Login successful!");
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message ||
          "Login failed. Please try again."
      );
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <motion.div
          className="w-full max-w-md p-6 space-y-6 bg-white dark:bg-black border border-white-500 rounded-lg shadow-lg"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-black dark:text-white">
              Login to Health Bridge
            </h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@healthbridge.com"
                        type="email"
                        className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Password
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link to="/usersignup" className="text-primary hover:underline">
              Don't have an account?
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
