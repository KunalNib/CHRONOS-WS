import React from 'react';
import { Radio, Shield, Sparkles, Clock, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export const GlobalContextBar: React.FC = () => {
  const { environment } = useAuth();
  const { wsConnected, judgeDemoActive, judgeDemoStep, currentDemoStepData } = useRealtime();

  const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 font-mono text-[11px] select-none text-slate-400 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      {/* Product & Environment Badges */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-bold text-white uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          <span>CHRONOS-WS</span>
        </div>

        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <span className="text-slate-500">ENV:</span>
          <span className="text-orange-400 font-bold">{environment}</span>
        </div>

        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <span className="text-slate-500">MODE:</span>
          <span className={`font-bold ${judgeDemoActive ? 'text-amber-400' : 'text-slate-300'}`}>
            {judgeDemoActive ? `JUDGE DEMO (#${judgeDemoStep}/11)` : 'LOCAL LAB'}
          </span>
        </div>
      </div>

      {/* Network & Threat Indicators */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">NETWORK:</span>
          <span className="flex items-center space-x-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>OPERATIONAL</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
          <span className="text-slate-500">THREAT:</span>
          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
            currentDemoStepData.risk === 'CRITICAL' || currentDemoStepData.risk === 'HIGH'
              ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
              : 'bg-amber-950 text-amber-300 border border-amber-800/40'
          }`}>
            {currentDemoStepData.risk}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
          <span className="text-slate-500">AI MODEL:</span>
          <span className="text-purple-400 font-bold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
            <span>ANALYSING</span>
          </span>
        </div>

        {/* WebSocket Live Connection Badge */}
        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
            {wsConnected ? 'LIVE STREAM' : 'OFFLINE'}
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-1 text-slate-500 border-l border-slate-800 pl-3">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTimeStr}</span>
        </div>
      </div>
    </div>
  );
};
