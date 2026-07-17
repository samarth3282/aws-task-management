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

  const checkSessionSilent = useCallback(async () => {
    if (!user) return;
    const isValid = await verifySession();
    if (!isValid) {
      await authSignOut();
      setUser(null);
      alert("You have been signed out because you logged in on another device.");
    }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSessionSilent();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Check every 15 seconds in the background
    const interval = setInterval(() => {
      checkSessionSilent();
    }, 15000);

    const handleInvalidation = () => checkSessionSilent();
    window.addEventListener("session_invalidated", handleInvalidation);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("session_invalidated", handleInvalidation);
      clearInterval(interval);
    };
  }, [checkSessionSilent]);

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
