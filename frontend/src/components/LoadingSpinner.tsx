import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 50,
  color = "#000000",
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%", // Ensure the parent container takes up full height
        width: "100%", // Ensure the parent container takes up full width
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="31.415, 31.415"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
};
