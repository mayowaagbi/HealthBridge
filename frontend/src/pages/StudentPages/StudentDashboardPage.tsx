import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastAction } from "../../components/ui/toast";
import { useToast } from "../../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
// Import the shared components
import StudentNavBar from "./components/StudentNavBar";

// Import dashboard widgets
import HealthAlerts from "../../components/Dashboard/HealthAlerts";
import UpcomingAppointments from "../../components/Dashboard/UpcomingAppointments";
import WaterIntake from "../../components/Dashboard/WaterIntake";
import StepCount from "../../components/Dashboard/StepCount";
import MentalHealthResources from "../../components/Dashboard/MentalHealthResources";
import AmbulanceRequest from "../../components/Dashboard/AmbulanceRequest";
import WeeklyHealthOverview from "../../components/Dashboard/WeeklyHealthOverview";
import QuickLinks from "../../components/Dashboard/QuickLinks";
import { MoodAndJournal } from "../../components/Dashboard/MoodAndJournal";
import BMICalculator from "../../components/Dashboard/BMICalculator";

export default function StudentDashboardPage() {
  const [waterIntake, setWaterIntake] = useState(1.5);
  const [stepCount, setStepCount] = useState(0);
  const [sleepHours, setSleepHours] = useState(7.5);

  const { toast } = useToast();

  const waterGoal = 2.5;
  const stepGoal = 10000;
  const sleepGoal = 8;

  useEffect(() => {
    if (waterIntake >= waterGoal) {
      toast({
        title: "Water Intake Goal Reached!",
        description: "Great job staying hydrated today!",
        action: <ToastAction altText="Close">Dismiss</ToastAction>,
      });
    }
    if (stepCount >= stepGoal) {
      toast({
        title: "Step Goal Reached!",
        description: "Congratulations on meeting your step goal!",
        action: <ToastAction altText="Close">Dismiss</ToastAction>,
      });
    }
    if (sleepHours >= sleepGoal) {
      toast({
        title: "Sleep Goal Reached!",
        description: "You've met your sleep goal. Keep up the good rest!",
        action: <ToastAction altText="Close">Dismiss</ToastAction>,
      });
    }
  }, [waterIntake, stepCount, sleepHours, toast]);

  const handleWaterChange = (amount: number) => {
    setWaterIntake((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="">
        <StudentNavBar />
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

          {/* Physical Health Section */}
          <h2 className="text-2xl font-semibold mb-4">Physical Health</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <HealthAlerts />
            <UpcomingAppointments />
            <WaterIntake
              waterIntake={waterIntake}
              waterGoal={waterGoal}
              onChange={handleWaterChange}
            />
            <StepCount stepCount={stepCount} stepGoal={stepGoal} />
            {/* <SleepTracker sleepHours={sleepHours} sleepGoal={sleepGoal} /> */}
          </div>

          {/* Mental Health Resources Section */}
          <h2 className="text-2xl font-semibold mb-4">
            Mental Health Resources
          </h2>
          <div className="flex flex-row flex-wrap justify-center gap-4 mb-8 ">
            {/* sm:flex-wrap */}
            <Card className="w-full md:w-[45%] lg:w-[30%]">
              <CardHeader>
                <CardTitle>Mood Tracker</CardTitle>
                <CardDescription>Track your daily mood</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodAndJournal />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>
                  Recently added health tips and articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MentalHealthResources />
                {/* <div className="w-full md:w-[45%] lg:w-[65%]">
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contacts Section */}
          <h2 className="text-2xl font-semibold mb-4">Ambulance Request</h2>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <AmbulanceRequest />
            <BMICalculator />
          </div>

          {/* Weekly Health Overview */}
          <WeeklyHealthOverview />

          {/* Quick Links */}
          <QuickLinks />
        </motion.div>
        <Outlet />
      </main>
    </div>
  );
}
