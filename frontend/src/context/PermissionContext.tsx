import React, { createContext, useContext } from 'react';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  role: UserRole;
  permissions: Permission[];
  hasPermission: (perm: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role: UserRole = user?.role || 'VIEWER';
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;

  const hasPermission = (perm: Permission): boolean => {
    return permissions.includes(perm);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(roles)) {
      return roles.includes(role);
    }
    return role === roles;
  };

  return (
    <PermissionContext.Provider value={{ role, permissions, hasPermission, hasRole }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return ctx;
};

export const useRole = (): UserRole => {
  const { role } = usePermission();
  return role;
};

export const useCan = (permission: Permission): boolean => {
  const { hasPermission } = usePermission();
  return hasPermission(permission);
};
