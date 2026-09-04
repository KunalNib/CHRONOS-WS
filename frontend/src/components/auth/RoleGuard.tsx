import React from 'react';
import { usePermission } from '../../context/PermissionContext';
import { Permission, UserRole } from '../../types/auth';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable';
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permission,
  roles,
  fallback,
  mode = 'hide'
}) => {
  const { hasPermission, hasRole } = usePermission();

  const isAllowed =
    (!permission || hasPermission(permission)) && (!roles || hasRole(roles));

  if (isAllowed) {
    return <>{children}</>;
  }

  if (mode === 'disable') {
    return (
      <div className="relative group opacity-50 cursor-not-allowed pointer-events-none">
        {children}
        <div className="absolute inset-0 bg-slate-950/60 rounded-lg flex items-center justify-center border border-dashed border-rose-500/40">
          <div className="flex items-center space-x-1 text-[10px] font-mono text-rose-400">
            <ShieldAlert className="w-3 h-3" />
            <span>RESTRICTED FOR YOUR ROLE</span>
          </div>
        </div>
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
};
