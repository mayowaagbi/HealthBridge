import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { disconnectSocket } from "../../../hooks/sockets";
import { Heart, Menu, X } from "lucide-react";
import ThemeToggle from "../../../components/ThemeToggle";

function StudentNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("Role");

    disconnectSocket();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-black shadow-md">
      {/* Logo */}
      <Link className="flex items-center justify-center" to="student/dashboard">
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
          className="ml-2 text-lg font-bold text-gray-900 dark:text-white"
        >
          CHMS
        </motion.span>
      </Link>

      {/* Hamburger Menu Icon (Mobile Only) */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <X className="h-6 w-6 text-gray-900 dark:text-white" />
        ) : (
          <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
        )}
      </button>

      {/* Navigation Links (Desktop Only) */}
      <nav className="hidden md:flex items-center gap-4 sm:gap-6 ml-auto">
        <ThemeToggle />
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/student/appointments"
        >
          Appointments
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/student/health-records"
        >
          Health Records
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/student/health-goals"
        >
          Health Goals
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/student/notifications"
        >
          Notifications
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/student/profile"
        >
          Profile
        </Link>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </nav>

      {/* Mobile Menu (Conditional Rendering) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50">
          <nav className="flex flex-col p-6 space-y-6">
            <ThemeToggle />
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/student/appointments"
              onClick={toggleMenu}
            >
              Appointments
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/student/health-records"
              onClick={toggleMenu}
            >
              Health Records
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/student/health-goals"
              onClick={toggleMenu}
            >
              Health Goals
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/student/notifications"
              onClick={toggleMenu}
            >
              Notifications
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/student/profile"
              onClick={toggleMenu}
            >
              Profile
            </Link>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full"
            >
              Logout
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default StudentNavBar;
