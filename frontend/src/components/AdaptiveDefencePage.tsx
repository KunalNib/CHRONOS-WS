import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Eye,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Activity,
  History,
  Lock,
  Database,
  Key,
  Server,
  RefreshCw,
  FileCheck,
  Info,
  HelpCircle,
  Zap
} from 'lucide-react';
import {
  fetchCurrentDefence,
  fetchDefenceHistory,
  DefenceCurrentResponse,
  DefenceHistoryResponse,
  DefenceDecision,
  DefenceAction
} from '../services/api';

export const AdaptiveDefencePage: React.FC = () => {
  const [currentDefence, setCurrentDefence] = useState<DefenceCurrentResponse | null>(null);
  const [historyData, setHistoryData] = useState<DefenceHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadDefenceData = async () => {
    try {
      setLoading(true);
      const current = await fetchCurrentDefence();
      const history = await fetchDefenceHistory();
      setCurrentDefence(current);
      setHistoryData(history);
    } catch (err) {
      console.error('Failed to load adaptive defence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefenceData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadDefenceData, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const decision = currentDefence?.decision;

  const renderActionBadge = (act: string) => {
    switch (act.toUpperCase()) {
      case 'PROTECT':
        return (
          <span key={act} className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>PROTECT</span>
          </span>
        );
      case 'MONITOR':
        return (
          <span key={act} className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>MONITOR</span>
          </span>
        );
      case 'DECEIVE':
        return (
          <span key={act} className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>DECEIVE</span>
          </span>
        );
      default:
        return (
          <span key={act} className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {act}
          </span>
        );
    }
  };

  const getTargetIcon = (target: string) => {
    if (target.includes('auth')) return Key;
    if (target.includes('db') || target.includes('decoy')) return Database;
    if (target.includes('admin')) return Lock;
    return Server;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-amber-500/20 rounded-xl border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 12 — Adaptive Defence Engine
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Action Policy Enforcement & Real Production Asset Boundary Protection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
              autoRefresh
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{autoRefresh ? 'DEFENCE LOOP (3s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={loadDefenceData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Top Status & Policy Audit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">OVERALL THREAT RISK</span>
            <span className={`text-xl font-bold ${
              decision?.overall_risk === 'CRITICAL' ? 'text-rose-400' :
              decision?.overall_risk === 'HIGH' ? 'text-orange-400' :
              decision?.overall_risk === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {decision?.overall_risk || 'ELEVATED'}
            </span>
          </div>
          <ShieldAlert className="w-8 h-8 text-slate-700" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">DECISION CONFIDENCE</span>
            <span className="text-xl font-bold text-cyan-400">
              {((decision?.confidence || 0.85) * 100).toFixed(1)}%
            </span>
          </div>
          <Zap className="w-8 h-8 text-cyan-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">POLICY ENGINE AUDIT</span>
            <span className={`text-sm font-bold flex items-center space-x-1 ${
              decision?.policy_approved ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{decision?.policy_approved ? 'ALL PASSED' : 'REJECTED/OVERRIDDEN'}</span>
            </span>
          </div>
          <FileCheck className="w-8 h-8 text-slate-700" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">SIMULTANEOUS ACTIONS</span>
            <span className="text-xl font-bold text-purple-400">
              {decision?.actions.reduce((acc, a) => acc + a.actions.length, 0) || 0} ACTIVE
            </span>
          </div>
          <Crosshair className="w-8 h-8 text-purple-500/30" />
        </div>
      </div>

      {/* Main Targets Grid */}
      <div className="space-y-4 font-mono">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span>Target Asset Defensive Action Plan (Simultaneous Action Support)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decision?.actions.map((act, idx) => {
            const TargetIcon = getTargetIcon(act.target_asset);
            const isRealAsset = !act.target_asset.includes('decoy');

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative overflow-hidden"
              >
                {/* Target Asset Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      <TargetIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{act.target_asset}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isRealAsset
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}>
                        {isRealAsset ? 'REAL PRODUCTION ASSET (ALWAYS PROTECTED)' : 'SYNTHETIC HONEYPOT DECOY'}
                      </span>
                    </div>
                  </div>

                  {/* Simultaneous Action Badges */}
                  <div className="flex items-center space-x-1.5">
                    {act.actions.map(a => renderActionBadge(a))}
                  </div>
                </div>

                {/* Section: Why this action? */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why this action?</span>
                  </span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {act.rationale}
                  </p>
                </div>

                {/* Section: Which evidence? */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-purple-400 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Which evidence?</span>
                  </span>
                  <ul className="space-y-1">
                    {decision.evidences.map((ev, evIdx) => (
                      <li key={evIdx} className="text-xs text-slate-400 flex items-start space-x-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>
                          <strong className="text-slate-300">{ev.feature}:</strong> {ev.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Engine Audit Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Policy Engine Guardrail Validation Audit (Real Asset Safety Enforcement)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
            ENGINE VALIDATED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decision?.policies.map((pol, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                pol.passed
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <span className="text-slate-500 font-mono text-[10px]">{pol.policy_id}</span>
                  <span>{pol.policy_name}</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  pol.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {pol.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{pol.rule_description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision History Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Adaptive Decision Evolution History ({historyData?.total_decisions || 0} Snapshots)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Policy-Validated Decisions</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {historyData?.history.slice().reverse().map((histDec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-slate-500 font-mono text-[10px]">{histDec.decision_id}</span>
                <span className="text-slate-400">{new Date(histDec.timestamp).toLocaleTimeString()}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                  RISK: {histDec.overall_risk}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {histDec.actions.map((act, aIdx) => (
                  <span key={aIdx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <strong className="text-white">{act.target_asset}:</strong> {act.actions.join('+')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
