import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../context/PermissionContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = usePermission();

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-mono">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-rose-950/80 border border-rose-800/40 text-rose-400 text-xs font-bold rounded-full uppercase tracking-wider">
            Access Restricted (403)
          </div>
          <h1 className="text-xl font-bold text-white uppercase">Permission Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have sufficient RBAC privileges to access this command center module.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-1 text-xs">
          <div className="text-[10px] text-slate-500 uppercase">Current Session Context</div>
          <div className="text-slate-300 font-bold">Operator: {user?.name}</div>
          <div className="text-orange-400 font-bold">Active Role: {role}</div>
        </div>

        <div className="pt-2 flex items-center justify-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
