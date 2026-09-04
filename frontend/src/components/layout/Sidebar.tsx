import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Brain,
  GitCommit,
  ShieldCheck,
  Crosshair,
  Radio,
  FileText,
  Users,
  FileCode,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePermission } from '../../context/PermissionContext';
import { Permission } from '../../types/auth';

const STORAGE_KEY = 'sidebar_collapsed';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_dashboard' },
  { path: '/network', label: 'Network & Defense', icon: Network, perm: 'view_network' },
  { path: '/ai', label: 'AI & Predictions', icon: Brain, perm: 'view_ai_model' },
  { path: '/attack-path', label: 'Attack Path', icon: GitCommit, perm: 'view_attack_paths' },
  { path: '/defence', label: 'Adaptive Defence', icon: ShieldCheck, perm: 'view_defence' },
  { path: '/deception', label: 'Deception Zone', icon: Crosshair, perm: 'view_deception_status' },
  { path: '/telemetry', label: 'Telemetry Stream', icon: Radio, perm: 'view_telemetry' },
  { path: '/reports', label: 'Analytics Reports', icon: FileText, perm: 'view_reports' }
];

const ADMIN_ITEMS: NavItem[] = [
  { path: '/admin/users', label: 'User Management', icon: Users, perm: 'manage_users' },
  { path: '/admin/audit', label: 'Audit Logs', icon: FileCode, perm: 'view_audit_logs' },
  { path: '/settings', label: 'Settings', icon: Settings, perm: 'view_dashboard' }
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const { hasPermission } = usePermission();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const renderNavGroup = (items: NavItem[], title?: string) => (
    <div className="space-y-1">
      {title && !collapsed && (
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          {title}
        </div>
      )}
      {items.map((item) => {
        const IconComp = item.icon;
        const permitted = hasPermission(item.perm);

        if (!permitted && collapsed) return null;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-xl transition-all font-mono text-xs ${
                isActive
                  ? 'bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 shadow-sm'
                  : permitted
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <IconComp className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`bg-slate-900/90 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-3 space-y-6 overflow-y-auto">
        {renderNavGroup(NAV_ITEMS, 'DEFENCE OPERATIONS')}
        <div className="pt-2 border-t border-slate-800/80">
          {renderNavGroup(ADMIN_ITEMS, 'ADMINISTRATION')}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-orange-400" /> : <ChevronLeft className="w-4 h-4 text-orange-400" />}
        </button>
      </div>
    </aside>
  );
};
