import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Target, Bell, FileText, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";

export default function ServicesPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="">
        <Navbar />
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            className="container px-4 md:px-6"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h1
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none mb-8"
              variants={fadeIn}
            >
              Our Services
            </motion.h1>
            <motion.div
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
            >
              <motion.div
                className="flex flex-col items-center space-y-2 border p-4 rounded-lg"
                variants={fadeIn}
              >
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Appointment Scheduling</h2>
                <p className="text-sm text-gray-500 text-center">
                  Schedule and manage your medical appointments with ease.
                  Choose available time slots and receive reminders for upcoming
                  visits.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border p-4 rounded-lg"
                variants={fadeIn}
              >
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Health Goal Tracking</h2>
                <p className="text-sm text-gray-500 text-center">
                  Set and track personalized health goals. Monitor your progress
                  and achieve milestones with our user-friendly tools.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border p-4 rounded-lg"
                variants={fadeIn}
              >
                <Bell className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Customizable Alerts</h2>
                <p className="text-sm text-gray-500 text-center">
                  Receive real-time alerts and reminders for medications,
                  appointments, and important health updates.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border p-4 rounded-lg"
                variants={fadeIn}
              >
                <FileText className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Secure Medical Records</h2>
                <p className="text-sm text-gray-500 text-center">
                  Upload, store, and access your medical records securely. Keep
                  track of prescriptions, test results, and health history.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border p-4 rounded-lg"
                variants={fadeIn}
              >
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Data Privacy & Security</h2>
                <p className="text-sm text-gray-500 text-center">
                  Your health data is protected with advanced encryption and
                  security measures, ensuring your information remains private.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2024 Health Bridge. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
