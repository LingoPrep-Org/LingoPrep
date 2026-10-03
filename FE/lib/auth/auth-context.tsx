"use client";

import * as React from "react";
import type { AuthTokens, AuthUser, Role } from "./types";
import { ROLE_HOMES } from "./types";
import AuthService from "@/services/auth.services/auth.services";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (user: AuthUser, tokens: AuthTokens) => void;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "aptis-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await AuthService.refresh(refreshToken);
          const nextUser: AuthUser = {
            id: String(response.user.id),
            name: response.user.full_name,
            email: response.user.email,
            role: response.user.role,
            avatarUrl: response.user.avatar_url,
          };
          persist(nextUser, {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });
          return;
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const persist = React.useCallback(
    (u: AuthUser | null, tokens?: AuthTokens) => {
      setUser(u);
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        if (tokens) {
          localStorage.setItem("access_token", tokens.accessToken);
          localStorage.setItem("refresh_token", tokens.refreshToken);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    },
    [],
  );

  const signIn = React.useCallback(
    (nextUser: AuthUser, tokens: AuthTokens) => {
      persist(nextUser, tokens);
    },
    [persist],
  );

  const signOut = React.useCallback(() => {
    persist(null);
  }, [persist]);

  const value = React.useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function getRoleHome(role: Role) {
  return ROLE_HOMES[role];
}
