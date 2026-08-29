import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch, apiJson } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if the user has a valid session via HttpOnly cookies
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await apiFetch("/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUser(data.user);
        }
      } catch {
        // Network error or server unavailable — stay logged out
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiJson("/auth/login", { email, password });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const res = await apiJson("/auth/signup", { username, email, password });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Even if the server call fails, clear local state
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
