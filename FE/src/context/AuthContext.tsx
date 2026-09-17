import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  theme: 'dark' | 'light';
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: UserRole) => Promise<void>;
  register: (fullName: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lingoprep_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedUser = localStorage.getItem('lingoprep_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('lingoprep_user');
      }
    }
    
    // Auto-login default learner if no session exists
    if (!token && !savedUser) {
      loginDemo('LEARNER').catch(() => {});
    } else {
      setIsLoading(false);
    }

    // Theme initialization
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const emails: Record<UserRole, string> = {
        LEARNER: 'learner@lingoprep.com',
        TEACHER: 'teacher@lingoprep.com',
        ADMIN: 'admin@lingoprep.com',
      };
      const email = emails[role];
      const res = await api.login(email, '123456');
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, role: UserRole = 'LEARNER') => {
    setIsLoading(true);
    try {
      const res = await api.register(fullName, email, password, role);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('lingoprep_user', JSON.stringify(u));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        theme,
        login,
        loginDemo,
        register,
        logout,
        refreshUser,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
