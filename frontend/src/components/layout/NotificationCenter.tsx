import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Brain, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: 'Critical' | 'Warning' | 'AI' | 'Defence' | 'System';
  title: string;
  message: string;
  timestamp: string;
  path: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif-1', category: 'Critical', title: 'Lateral Movement Risk Elevated', message: 'Predicted lateral movement risk crossed 78% threshold on Auth Service.', timestamp: '10:42:21', path: '/attack-paths', read: false },
  { id: 'notif-2', category: 'Warning', title: 'Credential Objective Spike', message: 'Attacker objective hypothesis probability increased to 85%.', timestamp: '10:42:19', path: '/objectives', read: false },
  { id: 'notif-3', category: 'Defence', title: 'Adaptive Decoy Activated', message: 'Database Honey Decoy initialized on isolated VLAN 99 (Port 5433).', timestamp: '10:42:14', path: '/deception', read: false },
  { id: 'notif-4', category: 'AI', title: 'World Model S_(t+1) Forecast', message: 'Temporal LSTM model accurately predicted CPU surge on Server B.', timestamp: '10:41:55', path: '/ai-world-model', read: true }
];

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelect = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    navigate(item.path);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Critical':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'AI':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Defence':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="font-bold text-white uppercase text-[11px]">System Alerts & Notifications</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllRead}
            className="text-[10px] text-slate-400 hover:text-orange-400"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`w-full text-left p-3 hover:bg-slate-800/60 transition-colors flex items-start space-x-3 ${
              !item.read ? 'bg-orange-500/5' : ''
            }`}
          >
            <div className="pt-0.5">{getCategoryIcon(item.category)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{item.title}</span>
                <span className="text-[10px] text-slate-500">{item.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{item.message}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
