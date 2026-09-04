import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthSession } from '../types/auth';
import { authService, SEEDED_USERS } from '../services/authService';

export type EnvironmentMode = 'LOCAL DEFENCE LAB' | 'DATASET REPLAY' | 'JUDGE DEMO';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  environment: EnvironmentMode;
  setEnvironment: (env: EnvironmentMode) => void;
  login: (email: string, pass: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getCurrentSession());
  const [environment, setEnvironment] = useState<EnvironmentMode>('LOCAL DEFENCE LAB');

  useEffect(() => {
    // Default fallback to Admin user for quick dev preview if no session exists
    if (!session) {
      const defaultAdmin = SEEDED_USERS[0];
      const initialSession: AuthSession = {
        token: 'default-admin-token',
        user: defaultAdmin,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        environment: 'LOCAL DEFENCE LAB'
      };
      setSession(initialSession);
    }
  }, []);

  const login = async (email: string, pass: string, remember: boolean = true) => {
    const newSession = await authService.login(email, pass, remember);
    setSession(newSession);
  };

  const logout = async () => {
    await authService.logout();
    setSession(null);
  };

  const switchRole = (role: UserRole) => {
    const updated = authService.switchUserRole(role);
    if (updated) {
      setSession(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isAuthenticated: !!session,
        environment,
        setEnvironment,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
