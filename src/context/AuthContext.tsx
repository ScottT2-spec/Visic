"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const res = await api.get<User>("/api/auth/me");
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      api.setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  };

  const signup = async (signupData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const res = await api.post<{ token: string; user: User }>("/api/auth/signup", signupData);
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Signup failed" };
  };

  const logout = () => {
    api.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeSiteId");
    }
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
