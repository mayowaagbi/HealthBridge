import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Heart, ArrowRight, Activity, BookOpen, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
export default function LandingPage() {
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
      <header>
        <Navbar />
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <motion.div
            className="container px-4 md:px-6"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div className="space-y-2" variants={fadeIn}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to HealthBridge
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Bridging the gap between healthcare and education for a
                  healthier, happier campus community. Experience comprehensive
                  care, wellness programs, and health education all in one
                  place.
                </p>
              </motion.div>
              <motion.div className="space-x-4" variants={fadeIn}>
                <Button asChild>
                  <Link to="/services">
                    Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Get in Touch</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="container px-4 md:px-6"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8"
              variants={fadeIn}
            >
              Our Comprehensive Approach
            </motion.h2>
            <motion.div
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
            >
              <motion.div
                className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg"
                variants={fadeIn}
              >
                <Heart className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Holistic Health Services</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  From routine check-ups to specialized care, our comprehensive
                  health services cater to all your medical needs. Our team of
                  experienced healthcare professionals is dedicated to providing
                  personalized care and support.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg"
                variants={fadeIn}
              >
                <Activity className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">
                  Innovative Wellness Programs
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Embrace a healthier lifestyle with our cutting-edge wellness
                  programs. From fitness classes and nutrition counseling to
                  stress management workshops, we offer a holistic approach to
                  your well-being.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg"
                variants={fadeIn}
              >
                <BookOpen className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">
                  Empowering Health Education
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Knowledge is power, especially when it comes to your health.
                  Our educational resources, workshops, and seminars equip you
                  with the information and skills to make informed decisions
                  about your health and well-being.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            className="container px-4 md:px-6"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8"
              variants={fadeIn}
            >
              Why Choose Health Bridge?
            </motion.h2>
            <motion.div
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
            >
              <motion.div
                className="flex flex-col items-center space-y-2 p-4 rounded-lg"
                variants={fadeIn}
              >
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Student-Centered Care</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  We understand the unique health challenges faced by students.
                  Our services are tailored to meet your specific needs,
                  ensuring you can focus on your studies and personal growth.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 p-4 rounded-lg"
                variants={fadeIn}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
                <h3 className="text-xl font-bold">Integrated Approach</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  We believe in treating the whole person, not just symptoms.
                  Our integrated approach combines medical care, mental health
                  support, and wellness programs for comprehensive health
                  management.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2 p-4 rounded-lg"
                variants={fadeIn}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m12 14 4-4" />
                  <path d="m14 12 2 2" />
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
                </svg>
                <h3 className="text-xl font-bold">Accessible & Convenient</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  We offer a seamless and user-friendly experience. Access your
                  health services and information anytime, anywhere, making it
                  easier to stay on top of your health goals.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
