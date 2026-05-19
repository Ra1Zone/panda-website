"use client";

import { createContext, useContext, ReactNode } from "react";

interface AuthCtx {
  isAuthenticated: boolean;
  username: string;
}

const Ctx = createContext<AuthCtx>({ isAuthenticated: false, username: "" });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <Ctx.Provider value={{ isAuthenticated: false, username: "" }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
