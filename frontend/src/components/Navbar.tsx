import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react"; // Import Menu and X icons
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-black sticky border-b-2">
      {/* Logo */}
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
          className="ml-2 text-lg font-bold text-gray-900 dark:text-white"
        >
          HealthBridge
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
      <nav className="hidden md:flex items-center gap-8 ml-auto">
        <ThemeToggle />
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/services"
        >
          Services
        </Link>
        {/* <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/facilities"
        >
          Facilities
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/education"
        >
          Education
        </Link> */}
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
          to="/contact"
        >
          Contact
        </Link>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Login
          </Button>
        </Link>
        <Link to="/usersignup">
          <Button variant="outline" size="sm">
            Signup
          </Button>
        </Link>
      </nav>

      {/* Mobile Menu (Conditional Rendering) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50">
          <nav className="flex flex-col p-6 space-y-6">
            <ThemeToggle />
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/services"
              onClick={toggleMenu}
            >
              Services
            </Link>
            {/* <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/facilities"
              onClick={toggleMenu}
            >
              Facilities
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/education"
              onClick={toggleMenu}
            >
              Education
            </Link> */}
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 text-gray-900 dark:text-white"
              to="/contact"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link to="/login" onClick={toggleMenu}>
              <Button variant="outline" size="sm" className="w-full">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Navbar;
