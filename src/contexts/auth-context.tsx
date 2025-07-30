"use client";

import { authAPI } from "@/lib/api/auth";
import type { AuthResponse, User } from "@/lib/schemas/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleAuth: (code: string) => Promise<void>;
  selectRole: (roleId: number) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has any roles
  const hasRole = user?.roles && user.roles.length > 0;
  const isAuthenticated = !!user && !!accessToken;

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (storedUser && storedAccessToken) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Save auth state to localStorage
  const saveAuthState = (authResponse: AuthResponse) => {
    const { data } = authResponse;
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authAPI.login({ email, password });
    saveAuthState(response);
    setIsLoading(false);
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authAPI.register({ email, password, confirmPassword: password, username: "" });
    saveAuthState(response);
    setIsLoading(false);
  };

  const googleAuth = async (code: string) => {
    setIsLoading(true);
    const response = await authAPI.googleAuth(code);
    saveAuthState(response);
    setIsLoading(false);
  };

  const selectRole = async (roleId: number) => {
    setIsLoading(true);
    const response = await authAPI.selectRole({ roleId });
    saveAuthState(response);
    setIsLoading(false);
  };

  const refreshAuth = async () => {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await authAPI.refreshToken(refreshToken);
      saveAuthState(response);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    hasRole: hasRole || false,
    login,
    register,
    googleAuth,
    selectRole,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
