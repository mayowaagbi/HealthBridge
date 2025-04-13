import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "submitted" | "error"
  >("idle");

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("submitting");
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setFormStatus("submitted");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-black">
          <motion.div
            className="container px-4 md:px-6"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h1
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8 text-black dark:text-white"
              variants={fadeIn}
            >
              Contact Us
            </motion.h1>
            <motion.p
              className="text-gray-500 dark:text-gray-400 md:text-xl text-center mb-12 max-w-[800px] mx-auto"
              variants={fadeIn}
            >
              We're here to help. Reach out to us with any questions or concerns
              about our services, facilities, or educational programs.
            </motion.p>
            <motion.div
              className="grid gap-10 lg:grid-cols-2"
              variants={stagger}
            >
              {/* Contact Form */}
              <motion.div className="space-y-8" variants={fadeIn}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="first-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black dark:text-white"
                      >
                        First name
                      </label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        required
                        className="bg-white dark:bg-gray-700 text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black dark:text-white"
                      >
                        Last name
                      </label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        required
                        className="bg-white dark:bg-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black dark:text-white"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      placeholder="johndoe@example.com"
                      type="email"
                      required
                      className="bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black dark:text-white"
                    >
                      Message
                    </label>
                    <Textarea
                      className="min-h-[100px] bg-white dark:bg-gray-700 text-black dark:text-white"
                      id="message"
                      placeholder="Enter your message here"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formStatus === "submitting"}
                  >
                    {formStatus === "submitting"
                      ? "Sending..."
                      : "Send Message"}
                  </Button>
                </form>
                {formStatus === "submitted" && (
                  <p className="text-green-600 dark:text-green-400 text-center">
                    Thank you for your message. We'll get back to you soon!
                  </p>
                )}
                {formStatus === "error" && (
                  <p className="text-red-600 dark:text-red-400 text-center">
                    There was an error sending your message. Please try again.
                  </p>
                )}
              </motion.div>

              {/* Contact Information */}
              <motion.div className="space-y-8" variants={fadeIn}>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      Email
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      info@healthbridge.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      Phone
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      Address
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      123 Health Bridge Ave, Medical City, HC 12345
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
