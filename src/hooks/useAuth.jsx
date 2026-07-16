import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentUser, signOut as authSignOut } from "../lib/auth";
import { withViewTransition } from "../lib/transition.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const current = await getCurrentUser();
    setUser(current);
    withViewTransition(() => setChecking(false));
    return current;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
