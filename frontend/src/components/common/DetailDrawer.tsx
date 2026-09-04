import React from 'react';
import { X, Info, Activity, ShieldCheck, HelpCircle, ArrowRight, Clock, FileText } from 'lucide-react';

export interface DetailDrawerData {
  title: string;
  subtitle?: string;
  type?: string;
  status?: string;
  summary: string;
  why: string;
  evidence: string[];
  actionApplied?: string;
  result?: string;
  timeline?: { time: string; event: string }[];
  rawAttributes?: Record<string, any>;
}

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailDrawerData | null;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl font-mono text-xs flex flex-col justify-between select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-orange text-[10px] uppercase font-bold">{data.type || 'INSPECTOR'}</span>
            {data.status && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-bold">
                {data.status}
              </span>
            )}
          </div>
          <h2 className="font-extrabold text-white text-sm mt-1">{data.title}</h2>
          {data.subtitle && <p className="text-[11px] text-slate-400 font-sans mt-0.5">{data.subtitle}</p>}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body Sections */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 font-sans">
        {/* SUMMARY SECTION */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono font-bold uppercase flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-orange-400" />
            <span>SUMMARY & EXPLANATION</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{data.summary}</p>
        </div>

        {/* WHY SECTION */}
        <div className="p-3 bg-amber-950/20 rounded-2xl border border-amber-800/40 space-y-1">
          <div className="text-[10px] text-amber-400 font-mono font-bold uppercase flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>WHY IS THIS NODE / EVENT HERE?</span>
          </div>
          <p className="text-xs text-amber-200 leading-relaxed font-sans">{data.why}</p>
        </div>

        {/* EVIDENCE LIST */}
        {data.evidence && data.evidence.length > 0 && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 font-mono font-bold uppercase flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>KEY EVIDENCE & FEATURES</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-300">
              {data.evidence.map((ev, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ACTION APPLIED */}
        {data.actionApplied && (
          <div className="p-3 bg-blue-950/20 rounded-2xl border border-blue-800/40 space-y-1 font-mono">
            <div className="text-[10px] text-blue-400 font-bold uppercase flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DEFENCE ACTION ENFORCED</span>
            </div>
            <div className="font-bold text-blue-200 text-xs">{data.actionApplied}</div>
          </div>
        )}

        {/* RESULT */}
        {data.result && (
          <div className="p-3 bg-emerald-950/20 rounded-2xl border border-emerald-800/40 space-y-1 font-sans">
            <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase flex items-center space-x-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>OBSERVABLE RESULT</span>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">{data.result}</p>
          </div>
        )}

        {/* TIMELINE */}
        {data.timeline && data.timeline.length > 0 && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 font-mono">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>STATE CHANGE TIMELINE</span>
            </div>
            <div className="space-y-1.5 border-l border-slate-800 pl-3">
              {data.timeline.map((t, idx) => (
                <div key={idx} className="text-[10px] space-y-0.5">
                  <span className="text-slate-500">{t.time}</span>
                  <div className="text-slate-200 font-bold">{t.event}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Close */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-right">
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
