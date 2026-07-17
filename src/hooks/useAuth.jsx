import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentUser, signOut as authSignOut, verifySession } from "../lib/auth";
import { withViewTransition } from "../lib/transition.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const current = await getCurrentUser();
    
    if (current) {
      const isValid = await verifySession();
      if (!isValid) {
        await authSignOut();
        setUser(null);
        withViewTransition(() => setChecking(false));
        alert("You have been signed out because you logged in on another device.");
        return null;
      }
    }
    
    setUser(current);
    withViewTransition(() => setChecking(false));
    return current;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refresh, user]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
