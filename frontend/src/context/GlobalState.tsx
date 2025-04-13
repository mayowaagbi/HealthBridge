// context/GlobalStateContext.tsx
import React, { createContext, useContext, useState } from "react";

// Define user roles
export enum UserRole {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  PROVIDER = "PROVIDER",
  SUPPORT = "SUPPORT",
}

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  role: UserRole;
  isLoggedIn: boolean;
  token?: string; // Optional token for JWT
}

// Define the shape of the global state
interface GlobalState {
  user: User | null;
  notifications: string[];
  setUser: (user: User | null) => void;
  addNotification: (message: string) => void;
  login: (token: string) => void; // Function to handle login with JWT
  logout: () => void; // Function to handle logout
}

// Default values
const defaultState: GlobalState = {
  user: null,
  notifications: [],
  setUser: () => {},
  addNotification: () => {},
  login: () => {},
  logout: () => {},
};

// Create the context
const GlobalStateContext = createContext<GlobalState>(defaultState);

// Provider component
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Function to add a notification
  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
  };

  // Function to handle login with JWT token
  const login = (token: string) => {
    try {
      // Decode the token to extract user data
      const decodedUser = decodeToken(token); // Assume decodeToken is a utility function
      setUser({
        ...decodedUser,
        isLoggedIn: true,
        token, // Store the token
      });
    } catch (error) {
      console.error("Invalid token:", error);
      addNotification("Failed to log in. Please try again.");
    }
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    addNotification("You have been logged out.");
  };

  return (
    <GlobalStateContext.Provider
      value={{
        user,
        notifications,
        setUser,
        addNotification,
        login,
        logout,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook for accessing the global state
export const useGlobalState = () => useContext(GlobalStateContext);

// Utility function to decode JWT token
const decodeToken = (token: string): User => {
  // Example: Use a library like jwt-decode to decode the token
  const decoded = JSON.parse(atob(token.split(".")[1])); // Simple decoding for demonstration
  return {
    id: decoded.sub, // Assuming 'sub' contains the user ID
    name: decoded.name,
    role: decoded.role as UserRole, // Ensure the role matches the UserRole enum
    isLoggedIn: true,
    token,
  };
};
