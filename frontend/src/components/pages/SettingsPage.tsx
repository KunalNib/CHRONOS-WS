import React from 'react';
import { Settings, User as UserIcon, Sliders, Shield, Brain, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../context/PermissionContext';
import { RoleGuard } from '../auth/RoleGuard';

export const SettingsPage: React.FC = () => {
  const { user, environment } = useAuth();
  const { role } = usePermission();

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
          Command Center Settings
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          System configurations, model thresholds, and environment preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Appearance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <UserIcon className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-white text-xs uppercase">Operator Profile & Appearance</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span>Operator Name:</span><strong className="text-white">{user?.name}</strong></div>
            <div className="flex justify-between"><span>Registered Email:</span><strong className="text-slate-300">{user?.email}</strong></div>
            <div className="flex justify-between"><span>Assigned Role:</span><strong className="text-orange-400 font-bold">{role}</strong></div>
            <div className="flex justify-between"><span>Theme:</span><strong className="text-slate-300">Dark Command Center (n8n inspired)</strong></div>
          </div>
        </div>

        {/* Realtime & Model Thresholds Card (Admin Protected) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-xs uppercase">Model & Realtime Parameters</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span>LSTM Prediction Horizon:</span><strong className="text-purple-300">+30 Seconds</strong></div>
            <div className="flex justify-between"><span>Confidence Threshold:</span><strong className="text-emerald-400">0.75 (75%)</strong></div>
            <div className="flex justify-between"><span>WebSocket Broadcast Rate:</span><strong className="text-orange-400">2.0s Interval</strong></div>
            <div className="flex justify-between"><span>Active Environment:</span><strong className="text-white">{environment}</strong></div>
          </div>

          <RoleGuard permission="manage_config" mode="disable">
            <button className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md">
              SAVE MODEL CONFIGURATION
            </button>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
};
