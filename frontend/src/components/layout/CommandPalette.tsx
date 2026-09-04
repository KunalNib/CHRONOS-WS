import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Network,
  Shield,
  Cpu,
  GitCommit,
  Target,
  Sliders,
  ShieldCheck,
  Crosshair,
  Radio,
  FileText,
  Users,
  FileCode,
  Settings,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { usePermission } from '../../context/PermissionContext';
import { useRealtime } from '../../context/RealtimeContext';

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const { triggerDeterministicDemo, resetJudgeDemo } = useRealtime();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally or toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dash', title: 'Dashboard Command Center', icon: LayoutDashboard, path: '/dashboard', perm: 'view_dashboard' },
    { id: 'net', title: 'Live Network Topology', icon: Network, path: '/network', perm: 'view_network' },
    { id: 'sec', title: 'Defense-in-Depth Security Matrix', icon: Shield, path: '/network-security', perm: 'view_network' },
    { id: 'world', title: 'AI World Model Prediction (S_t+1)', icon: Cpu, path: '/ai-world-model', perm: 'view_ai_model' },
    { id: 'attack', title: 'Attack-Path Prediction Graph', icon: GitCommit, path: '/attack-paths', perm: 'view_attack_paths' },
    { id: 'obj', title: 'Attacker Objective Hypotheses', icon: Target, path: '/objectives', perm: 'view_objectives' },
    { id: 'lb', title: 'Security-Aware Load Balancer', icon: Sliders, path: '/load-balancer', perm: 'view_network' },
    { id: 'def', title: 'Adaptive Defence Engine', icon: ShieldCheck, path: '/defence', perm: 'view_defence' },
    { id: 'dec', title: 'Secure Adaptive Deception Zone', icon: Crosshair, path: '/deception', perm: 'view_deception_status' },
    { id: 'tel', title: 'Telemetry Pipeline Stream', icon: Radio, path: '/telemetry', perm: 'view_telemetry' },
    { id: 'rep', title: 'System Analytics Reports', icon: FileText, path: '/reports', perm: 'view_reports' },
    { id: 'users', title: 'Admin User Management', icon: Users, path: '/admin/users', perm: 'manage_users' },
    { id: 'audit', title: 'Admin System Audit Logs', icon: FileCode, path: '/admin/audit', perm: 'view_audit_logs' },
    { id: 'set', title: 'System Settings', icon: Settings, path: '/settings', perm: 'view_dashboard' }
  ];

  const filteredCommands = commands.filter(
    (c) =>
      hasPermission(c.perm as any) &&
      c.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 space-x-3">
          <Search className="w-4 h-4 text-orange-400" />
          <input
            type="text"
            placeholder="Type a command or search pages... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder-slate-500 text-xs"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Actions */}
        <div className="p-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => {
              triggerDeterministicDemo(42);
              navigate('/dashboard');
              onClose();
            }}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-[11px] shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>TRIGGER DETERMINISTIC DEMO (SEED 42)</span>
          </button>
          <button
            onClick={() => {
              resetJudgeDemo();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[11px] flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEMO</span>
          </button>
        </div>

        {/* Navigation Command List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <IconComp className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
                  <span className="flex-1 font-medium">{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.path}</span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-slate-500">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
