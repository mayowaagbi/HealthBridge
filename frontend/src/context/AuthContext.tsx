import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (userData: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
        setError(null);
      } catch (err: any) {
        console.error("Error loading user:", err);
        setToken(null);
        setUser(null);
        setError("Authentication failed. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", userData);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout");
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
