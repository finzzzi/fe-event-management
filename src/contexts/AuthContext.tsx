"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, returnUrl?: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    referral?: string
  ) => Promise<void>;
  logout: () => void;
  redirectToLogin: (returnUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    returnUrl?: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      setToken(data.token);

      localStorage.setItem("token", data.token);
      toast.success("Login successful. Welcome back!");

      // Redirect to return URL or home page
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    referral_code?: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            ...(referral_code && { referral_code }),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      setToken(data.token);

      localStorage.setItem("token", data.token);
      toast.success(
        <div className="flex flex-col">
          <span>Registration successful</span>
          <span>Enjoy exploring amazing events</span>
        </div>
      );
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    toast.success("You have been logged out");
  };

  const redirectToLogin = (returnUrl?: string) => {
    if (returnUrl && !localStorage.getItem("returnUrl")) {
      localStorage.setItem("returnUrl", returnUrl);
    }
    router.push("/login");
  };

  const value = {
    token,
    isLoading,
    login,
    register,
    logout,
    redirectToLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
