import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { AppUser } from "../types";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAsGuest: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isGuest = localStorage.getItem("watchlist_guest_mode") === "true";
    if (isGuest) {
      setUser({
        uid: "guest_user",
        displayName: "Guest",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true,
      });
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isGuestNow = localStorage.getItem("watchlist_guest_mode") === "true";
      if (isGuestNow) {
        setLoading(false);
        return;
      }
      
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          isAnonymous: currentUser.isAnonymous,
          isGuest: false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      localStorage.removeItem("watchlist_guest_mode");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      localStorage.setItem("watchlist_guest_mode", "true");
      setUser({
        uid: "guest_user",
        displayName: "Guest",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true,
      });
    } catch (error) {
      console.error("Error signing in as guest", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("watchlist_guest_mode");
      if (user && !user.isGuest) {
        await signOut(auth);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
