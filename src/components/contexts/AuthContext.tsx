


// import React, { createContext, useContext, useState, useEffect, useRef } from "react";
// import api from "../../api/axios"

// type User = { username?: string; name?: string; id?: number; role?: string } | null;

// type AuthContextType = {
//   user: User;
//   isLoading: boolean;
//   login: (username: string, password: string) => Promise<User>;
//   logout: () => void;
//   refreshUserFromToken: () => Promise<User | null>;
// };
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));

//   const logout = () => {
//     try {
//       localStorage.removeItem("token");
//     } catch (e) {
//     }
//     lastTokenRef.current = null;
//     setUser(null);
//   };

//   // helper: extract a user object from various response shapes
//   const extractServerUser = (data: any): User => {
//     if (!data) return null;
//     const serverUser = data?.user ?? data?.admin ?? null;
//     if (serverUser) {
//       return {
//         username: serverUser.username ?? serverUser.email ?? undefined,
//         name: serverUser.name ?? serverUser.fullName ?? undefined,
//         id: serverUser.id ?? serverUser.user_id ?? undefined,
//         role: serverUser.role ?? undefined,
//       };
//     }
//     // fallback to top-level fields (your response had name: "admin" at top level)
//     return {
//       username: data?.username ?? data?.email ?? undefined,
//       name: data?.name ?? undefined,
//       id: data?.id ?? undefined,
//       role: data?.role ?? undefined,
//     };
//   };

//   // On mount: check for token and try refresh
//   useEffect(() => {
//     (async () => {
//       const token = localStorage.getItem("token");
//       lastTokenRef.current = token;
//       if (!token) {
//         logout();
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const res = await api.get("/login", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });

//         const data = res?.data ?? null;
//         const sUser = extractServerUser(data);

//         if (sUser) {
//           setUser(sUser);
//         } else {
//           logout();
//         }
//       } catch (err) {
//         // axios throws for non-2xx — treat as expired/invalid token
//         console.warn("Invalid/expired token on mount, logging out", err);
//         logout();
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//     // run once
//   }, []);

//   // Listen for localStorage changes across tabs
//   useEffect(() => {
//     const onStorage = (ev: StorageEvent) => {
//       if (ev.key === "token") {
//         const newToken = ev.newValue;
//         lastTokenRef.current = newToken;
//         if (!newToken) {
//           logout();
//         } else {
//           (async () => {
//             setIsLoading(true);
//             try {
//               const res = await api.get("/login", {
//                 headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
//               });
//               const data = res?.data ?? null;
//               const sUser = extractServerUser(data);
//               if (sUser) {
//                 setUser(sUser);
//               } else {
//                 logout();
//               }
//             } catch (err) {
//               console.warn("Token refresh on storage event failed", err);
//               logout();
//             } finally {
//               setIsLoading(false);
//             }
//           })();
//         }
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // Polling fallback to detect token removal in same tab
//   useEffect(() => {
//     let intervalId: number | null = null;

//     const startPolling = () => {
//       if (intervalId != null) return;
//       intervalId = window.setInterval(() => {
//         try {
//           const current = localStorage.getItem("token");
//           // If token went from present -> missing, logout
//           if (lastTokenRef.current && !current) {
//             lastTokenRef.current = null;
//             logout();
//           } else {
//             // keep lastTokenRef updated if token changed
//             lastTokenRef.current = current;
//           }
//         } catch (e) {
//           // ignore localStorage errors
//         }
//       }, 1000);
//     };

//     const stopPolling = () => {
//       if (intervalId != null) {
//         clearInterval(intervalId);
//         intervalId = null;
//       }
//     };

//     if (user) startPolling();
//     return () => {
//       stopPolling();
//     };
//   }, [user]);

//   const login = async (username: string, password: string): Promise<User> => {
//     setIsLoading(true);
//     try {
//       const res = await api.post(
//         "/login",
//         { username, password },
//         { headers: { "Content-Type": "application/json", Accept: "application/json" } }
//       );

//       const data = res?.data ?? {};

//       // Accept multiple token field names (access_token, accessToken, token)
//       const token =
//         data?.access_token ?? data?.accessToken ?? data?.token ?? data?.accessToken?.token ?? null;

//       if (!token) {
//         // Some APIs may return nested object like data: { access_token: '...' } — handle common shapes:
//         const maybeNested = data?.data ?? data?.token_data ?? null;
//         const tokenNested = maybeNested?.access_token ?? maybeNested?.token ?? null;
//         if (tokenNested) {
//           localStorage.setItem("token", tokenNested);
//           lastTokenRef.current = tokenNested;
//         } else {
//           throw new Error("No token received from login response");
//         }
//       } else {
//         localStorage.setItem("token", token);
//         lastTokenRef.current = token;
//       }

//       // Extract user info (data.user, data.admin, or top-level fields)
//       const sUser = extractServerUser(data);
//       const newUser: User = sUser ?? { username };

//       setUser(newUser);
//       return newUser;
//     } catch (err: any) {
//       // normalize error message
//       const msg =
//         err?.response?.data?.message ??
//         err?.response?.data?.error ??
//         err?.message ??
//         "Login failed";
//       throw new Error(msg);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const refreshUserFromToken = async (): Promise<User | null> => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         logout();
//         return null;
//       }
//       try {
//         const res = await api.get("/login", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });
//         const data = res?.data ?? null;
//         const sUser = extractServerUser(data);
//         if (sUser) {
//           setUser(sUser);
//           return sUser;
//         } else {
//           logout();
//           return null;
//         }
//       } catch (err) {
//         console.error("refreshUserFromToken error:", err);
//         logout();
//         return null;
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };



import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../../api/axios"; // adjust path if necessary


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
      if (!token) throw new Error("No token returned from server");
      saveToken(token);
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

  // Mount: restore token and optionally validate
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let token: string | null = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch {}
      lastTokenRef.current = token;
      setAxiosTokenHeader(token);

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/login");
        const u = extractUserFromResponse(res?.data ?? null);
        setUser(u);
      } catch {
        // keep token even if validation fails
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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

