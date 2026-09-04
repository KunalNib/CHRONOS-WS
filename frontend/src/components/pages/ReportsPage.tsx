import React from 'react';
import { FileText, ArrowRight, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CurrentSituation } from '../common/CurrentSituation';
import { useRealtime } from '../../context/RealtimeContext';

export const ReportsPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();

  const comparativeMetrics = [
    { metric: 'Overall Threat Risk Index', before: '42% (Nominal)', after: `${Math.round(currentDemoStepData.objectiveCreds * 100)}% (Contained)`, status: 'CONTAINED ✓' },
    { metric: 'Credential Objective Probability', before: '55%', after: '78%', status: 'MUTATED' },
    { metric: 'Database Objective Intent', before: '15%', after: '25%', status: 'MUTATED' },
    { metric: 'Server B Load Balancer Allocation', before: '34% Traffic', after: '10% Traffic', status: 'REROUTED ✓' },
    { metric: 'Adaptive Decoy DB Honeypot', before: 'INACTIVE', after: 'ACTIVE (Port 5433)', status: 'DECEIVED ★' },
    { metric: 'Real Production PostgreSQL DB Risk', before: 'HIGH (Targeted)', after: 'LOW (0 Leaks)', status: 'PROTECTED ✓' }
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Comparative Incident Analytics & Impact Reports
            </h1>
            <span className="badge-blue">BEFORE → AFTER IMPACT</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Post-incident performance analysis comparing initial baseline vs adaptive defence outcome
          </p>
        </div>

        <button className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors">
          <Download className="w-4 h-4 text-orange-400" />
          <span>EXPORT PDF REPORT</span>
        </button>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Post-Incident Evaluation`}
        where="Full CHRONOS-WS Platform"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="Comparative analytics verify that adaptive deception successfully diverted exfiltration with zero impact on real assets."
        whatNext="Archiving incident evidence report."
      />

      {/* Before -> After Comparative Analytics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase">Before vs After Defense Metrics Summary</span>
          <span className="badge-green font-bold">100% IMPACT CONTAINMENT</span>
        </div>

        <div className="space-y-3">
          {comparativeMetrics.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-white">{item.metric}</div>
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-slate-500">Before: {item.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400 font-bold">After: {item.after}</span>
                </div>
              </div>

              <span className="badge-green self-start sm:self-center">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
