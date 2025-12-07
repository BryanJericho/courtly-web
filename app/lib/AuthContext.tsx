// app/lib/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { getUser } from "./firestore";
import type { User, UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole | null;
  isAuthenticated: boolean;
  isUser: boolean;
  isPenjaga: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  role: null,
  isAuthenticated: false,
  isUser: false,
  isPenjaga: false,
  isAdmin: false,
});

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
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user data from Firestore with retry logic for new users
          let userData = await getUser(firebaseUser.uid);
          
          // Retry up to 3 times with delay if user data not found (for newly registered users)
          if (!userData) {
            for (let i = 0; i < 3; i++) {
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
              userData = await getUser(firebaseUser.uid);
              if (userData) break;
            }
          }

          if (!userData) {
            // If user data still not found after retries, create minimal user object
            console.warn("User data not found in Firestore for UID:", firebaseUser.uid);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              firstName: firebaseUser.displayName?.split(" ")[0] || "User",
              lastName: firebaseUser.displayName?.split(" ")[1] || "",
              phone: firebaseUser.phoneNumber || "",
              role: "user",
              createdAt: new Date().toISOString(),
            });
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const role = user?.role || null;
  const isAuthenticated = !!firebaseUser;
  const isUser = role === "user";
  const isPenjaga = role === "penjaga_lapangan";
  const isAdmin = role === "super_admin";

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    role,
    isAuthenticated,
    isUser,
    isPenjaga,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
