import React, { useState } from 'react';
import { Cpu, Brain, Activity, TrendingUp, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const AIWorldModelPage: React.FC = () => {
  const [horizon, setHorizon] = useState<'+10s' | '+30s' | '+60s'>('+30s');

  const timelineStates = [
    { label: 'S_(t-4)', failedLogins: 24, connRate: 210, riskScore: 12, status: 'NORMAL' },
    { label: 'S_(t-3)', failedLogins: 31, connRate: 290, riskScore: 24, status: 'NORMAL' },
    { label: 'S_(t-2)', failedLogins: 45, connRate: 410, riskScore: 48, status: 'SUSPICIOUS' },
    { label: 'S_(t-1)', failedLogins: 72, connRate: 670, riskScore: 68, status: 'SUSPICIOUS' },
    { label: 'S_t', failedLogins: 94, connRate: 820, riskScore: 78, status: 'HIGH_RISK' },
    { label: 'S_(t+1)', failedLogins: 120, connRate: 1040, riskScore: 88, status: 'PREDICTED_CRITICAL', isFuture: true },
    { label: 'S_(t+2)', failedLogins: 145, connRate: 1250, riskScore: 92, status: 'PREDICTED_CRITICAL', isFuture: true }
  ];

  const explainabilityFeatures = [
    { name: 'Failed Authentication Rate', weight: 42, direction: 'INCREASES RISK' },
    { name: 'Burst Connection Velocity', weight: 28, direction: 'INCREASES RISK' },
    { name: 'SYN Port Diversity Index', weight: 18, direction: 'INCREASES RISK' },
    { name: 'Database Query Anomaly', weight: 12, direction: 'INCREASES RISK' }
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
            AI World Model & Future State Prediction
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Temporal neural network estimating network trajectory S_t → S_(t+1)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="badge-purple">LSTM-v1 MODEL ACTIVE</span>
          <span className="badge-green">CONFIDENCE: 87%</span>
        </div>
      </div>

      {/* Historical State Timeline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="font-bold text-white text-xs uppercase">Temporal State Progression Timeline</span>
          <span className="text-[10px] text-slate-400">Numerical State Transitions (t-4 to t+2)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {timelineStates.map((s, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border ${
                s.isFuture
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                  : s.label === 'S_t'
                  ? 'bg-orange-950/30 border-orange-500 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>{s.label}</span>
                {s.isFuture ? (
                  <span className="text-[9px] text-purple-400 font-bold">FUTURE</span>
                ) : (
                  <span className="text-[9px] text-slate-500">HIST</span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-[10px]">
                <div>Logins: <strong className="text-white">{s.failedLogins}</strong></div>
                <div>Conn/s: <strong className="text-amber-400">{s.connRate}</strong></div>
                <div>Risk: <strong className={s.riskScore > 70 ? 'text-rose-400' : 'text-emerald-400'}>{s.riskScore}%</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Numerical Changes + Explainability Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Evaluation & Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs uppercase">Model Architecture Status</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between"><span>Model Version:</span><strong className="text-purple-300">LSTM-v1 (PyTorch)</strong></div>
              <div className="flex justify-between"><span>Hidden Layers:</span><strong className="text-white">2 Layers (128 units)</strong></div>
              <div className="flex justify-between"><span>Sequence Horizon:</span><strong className="text-orange-400">t+10s to t+60s</strong></div>
              <div className="flex justify-between"><span>Mean Absolute Error:</span><strong className="text-emerald-400">0.034 (Loss 0.0012)</strong></div>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-1">
              <div className="text-[10px] text-purple-400 font-bold uppercase">Model Trajectory Forecast</div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                LSTM sequential model predicts elevated credential access attempt progressing to lateral database query injection within +30 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Importance Explainability Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs uppercase">Model Feature Contribution</span>
            <HelpCircle className="w-4 h-4 text-orange-400" />
          </div>

          <div className="space-y-3">
            {explainabilityFeatures.map((f, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-bold">{f.name}</span>
                  <span className="text-rose-400 font-bold font-mono">↑ {f.weight}% IMPACT</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-rose-500 h-full"
                    style={{ width: `${f.weight * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans">
            <strong className="text-purple-400 font-mono">Explainability Audit: </strong>
            Feature weights calculated using SHAP gradient feature attribution on PyTorch sequential state vector.
          </div>
        </div>
      </div>
    </div>
  );
};
