"use client";

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  auth: any;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
