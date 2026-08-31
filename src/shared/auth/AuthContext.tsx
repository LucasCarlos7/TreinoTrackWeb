import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/features/auth/api";
import { clearStoredAuth, getStoredAuth, onAuthChanged, setStoredAuth, type StoredAuth } from "./authStorage";

interface AuthContextValue {
  auth: StoredAuth | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => getStoredAuth());

  useEffect(() => onAuthChanged(() => setAuth(getStoredAuth())), []);

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    setStoredAuth({ token: response.token, email: response.email, expiresAtUtc: response.expiresAtUtc });
  }

  async function register(email: string, password: string) {
    const response = await authApi.register(email, password);
    setStoredAuth({ token: response.token, email: response.email, expiresAtUtc: response.expiresAtUtc });
  }

  function logout() {
    clearStoredAuth();
  }

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  return context;
}
