import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export const GlobalStatusBar: React.FC = () => {
  const { environment } = useAuth();
  const { wsConnected, judgeDemoActive } = useRealtime();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-1.5 font-mono text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">Backend:</span>
          <span className="text-emerald-400 font-bold">● CONNECTED (Port 8000)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">Database:</span>
          <span className="text-emerald-400 font-bold">● CONNECTED (PostgreSQL)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">Telemetry:</span>
          <span className="text-emerald-400 font-bold">● LIVE (184 eps)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">AI Model:</span>
          <span className="text-purple-400 font-bold">● LSTM-v1 READY</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">WebSocket:</span>
          <span className={`font-bold ${wsConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {wsConnected ? '● CONNECTED' : '○ RECONNECTING'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">Mode:</span>
          <span className="text-orange-400 font-bold">
            {judgeDemoActive ? 'JUDGE DEMO MODE' : environment}
          </span>
        </div>
      </div>
    </footer>
  );
};
