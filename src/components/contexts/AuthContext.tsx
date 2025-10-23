
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../../api/axios"; // adjust path if necessary
import { useDispatch } from "react-redux";
import { fetchSiteSettings } from "../../redux/slices/sitesettings"; // named import - adjust path if needed
import {fetchOnlineOrders}  from "../../redux/slices/SalesSlice"
type User = {
  id?: number | string;
  username?: string;
  name?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUserFromToken: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "token";

function extractTokenFromLoginResponse(data: any): string | null {
  if (!data) return null;
  const candidates = [
    data?.access_token,
    data?.accessToken,
    data?.token,
    data?.data?.access_token,
    data?.data?.token,
    data?.token_data?.access_token,
    data?.token_data?.token,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string") return c;
    if (typeof c === "object") {
      if (c.token) return String(c.token);
      if (c.access_token) return String(c.access_token);
    }
  }
  return null;
}

function extractUserFromResponse(data: any): User {
  if (!data) return null;
  const serverUser = data?.user ?? data?.admin ?? data?.data?.user ?? data?.data?.admin ?? null;
  if (serverUser) {
    return {
      id: serverUser.id ?? serverUser.user_id ?? serverUser._id,
      username: serverUser.username ?? serverUser.email,
      name: serverUser.name ?? serverUser.fullName,
      role: serverUser.role,
    };
  }
  return {
    id: data?.id,
    username: data?.username ?? data?.email,
    name: data?.name,
    role: data?.role,
  };
}

function setAxiosTokenHeader(token: string | null) {
  try {
    if (token) {
      (api.defaults.headers as any).common = {
        ...(api.defaults.headers as any).common,
        Authorization: `Bearer ${token}`,
      };
    } else {
      if ((api.defaults.headers as any).common) delete (api.defaults.headers as any).common.Authorization;
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<any>(); // inside component — safe to use hooks
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastTokenRef = useRef<string | null>(null);

  // Save token + sync axios
  const saveToken = (token: string | null) => {
    try {
      if (!token) localStorage.removeItem(TOKEN_KEY);
      else localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    lastTokenRef.current = token;
    setAxiosTokenHeader(token);
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post("/admin-login", { username, password }, { headers: { Accept: "application/json" } });
      const token = extractTokenFromLoginResponse(res?.data);

      if (!token) {
        throw new Error("No token returned from server");
      }

      // persist token BEFORE calling fetchSiteSettings (thunk may read localStorage)
      saveToken(token);
      // set axios header as well (saveToken already does this)
      setAxiosTokenHeader(token);

      // Dispatch fetchSiteSettings to populate redux with site settings.
      // Await it but don't fail login if settings fetch fails.
      try {
        await dispatch(fetchSiteSettings());
        await dispatch(fetchOnlineOrders())
      } catch (settingsErr) {
        console.warn("Failed to fetch site settings after login:", settingsErr);
      }

      const u = extractUserFromResponse(res?.data) ?? { username };
      setUser(u);
      return u;
    } catch (err: any) {
      saveToken(null);
      const message = err?.response?.data?.message ?? err?.message ?? "Login failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserFromToken = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      setAxiosTokenHeader(token);
      const res = await api.get("/admin-login", { headers: { Accept: "application/json" } });
      const u = extractUserFromResponse(res?.data ?? null);
      setUser(u);
      return u;
    } catch {
      return null; // do NOT logout automatically
    } finally {
      setIsLoading(false);
    }
  };

  // Mount: restore token and optionally validate + fetch settings
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let token: string | null = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch {}
      lastTokenRef.current = token;
      setAxiosTokenHeader(token);

      // If token exists, fetch settings so UI/site config is available ASAP
      if (token) {
        try {
          // dispatch without awaiting to avoid blocking UI — errors are handled inside thunk
          dispatch(fetchSiteSettings());
        } catch (err) {
          console.warn("Failed to dispatch fetchSiteSettings on mount:", err);
        }
      }

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // validate token or refresh user info
        const res = await api.get("/login");
        const u = extractUserFromResponse(res?.data ?? null);
        setUser(u);
      } catch {
        // keep token even if validation fails; user stays null
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
    // include dispatch in deps to satisfy hooks rule
  }, [dispatch]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUserFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
