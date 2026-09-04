import React from 'react';
import { Target, Info, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ObjectivesPage: React.FC = () => {
  const objectiveProbabilities = [
    { key: 'Credentials', prob: 78, prevProb: 55, color: 'bg-orange-500', text: 'text-orange-400' },
    { key: 'Database', prob: 17, prevProb: 35, color: 'bg-amber-500', text: 'text-amber-400' },
    { key: 'Administrative Access', prob: 5, prevProb: 10, color: 'bg-rose-500', text: 'text-rose-400' }
  ];

  const evidenceHistory = [
    { timestamp: '10:42:19', event: 'Credential objective probability spiked from 55% to 78%', reason: 'Repeated authentication failures & token brute force' },
    { timestamp: '10:40:00', event: 'Database access objective probability recorded at 35%', reason: 'Initial port scan on PostgreSQL 5432' }
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
          Multi-Hypothesis Objective Inference
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Non-collapsing probability distribution over estimated attacker objectives
        </p>
      </div>

      {/* Probability Bars Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="font-bold text-white text-xs uppercase">Estimated Attacker Objective Probabilities</span>
          <span className="badge-purple">BAYESIAN INFERENCE</span>
        </div>

        <div className="space-y-5">
          {objectiveProbabilities.map((obj) => (
            <div key={obj.key} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-white">{obj.key}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">Was {obj.prevProb}%</span>
                  <span className={`font-bold font-mono text-sm ${obj.text}`}>{obj.prob}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`${obj.color} h-full transition-all duration-500`}
                  style={{ width: `${obj.prob}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-2xl flex items-center space-x-3 text-xs text-amber-300 font-sans">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> Objective probabilities are statistical hypotheses inferred from evidence streams, not guaranteed attacker intent.
          </span>
        </div>
      </div>

      {/* History & Evidence Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="font-bold text-white text-xs uppercase">Why Did Intent Probabilities Shift?</span>
          <TrendingUp className="w-4 h-4 text-orange-400" />
        </div>

        <div className="space-y-3">
          {evidenceHistory.map((h, i) => (
            <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{h.timestamp}</span>
                <span className="text-orange-400 font-bold">EVIDENCE SIGNAL</span>
              </div>
              <div className="font-bold text-white">{h.event}</div>
              <div className="text-slate-400 font-sans text-xs">{h.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
