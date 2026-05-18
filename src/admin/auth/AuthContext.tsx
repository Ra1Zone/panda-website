import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { authStore, type LoginResult } from "@/store/dataStore";

interface AuthCtx {
  isAuthenticated: boolean;
  username: string;
  login: (credential: string, password: string) => LoginResult;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authStore.isAuthenticated());
  const [username, setUsername] = useState(() => authStore.getUsername());

  const login = useCallback((credential: string, password: string): LoginResult => {
    const result = authStore.login(credential, password);
    if (result.ok) {
      setIsAuthenticated(true);
      setUsername(authStore.getUsername());
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authStore.logout();
    setIsAuthenticated(false);
    setUsername("");
  }, []);

  return <Ctx.Provider value={{ isAuthenticated, username, login, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
