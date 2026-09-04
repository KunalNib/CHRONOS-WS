import React, { useState, useEffect } from 'react';
import {
  Brain,
  Shield,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Server,
  Database,
  Sparkles,
  Layers,
  Activity,
  Zap,
  Info,
  Terminal,
  ShieldCheck,
  Eye,
  Crosshair
} from 'lucide-react';
import {
  fetchLatestReasoning,
  triggerReasoningAnalysis,
  LLMReasoningOutput
} from '../services/api';

export const LLMReasoningPage: React.FC = () => {
  const [reasoning, setReasoning] = useState<LLMReasoningOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadReasoningData = async () => {
    try {
      setLoading(true);
      const data = await fetchLatestReasoning();
      setReasoning(data);
    } catch (err) {
      console.error('Failed to load LLM reasoning data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    try {
      setLoading(true);
      const data = await triggerReasoningAnalysis();
      setReasoning(data);
    } catch (err) {
      console.error('Failed to trigger fresh LLM reasoning analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReasoningData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadReasoningData, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getActionBadgeStyle = (action: string) => {
    switch (action) {
      case 'PROTECT':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
          color: 'text-rose-400'
        };
      case 'MONITOR':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Eye,
          color: 'text-amber-400'
        };
      case 'DECEIVE':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: Sparkles,
          color: 'text-purple-400'
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Info,
          color: 'text-slate-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-500/20 via-cyan-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 9 — LLM Strategic Threat Reasoning Layer
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              AI Threat Objective Assessment, Evidence Attribution & Action Recommendations (PROTECT | MONITOR | DECEIVE)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
              autoRefresh
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{autoRefresh ? 'REASONING LOOP ACTIVE (4s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={handleTriggerAnalysis}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-md"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>
        </div>
      </header>

      {/* Provider & Model Label Banner (Explicit Requirement) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">ACTIVE REASONING PROVIDER:</span>
              <span className="text-sm font-bold text-white">{reasoning?.provider || 'LOCAL DEMO FALLBACK REASONER (RULE-BASED MOCK)'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {reasoning?.is_mock
                ? 'Running deterministic local mock rule-based provider for demo reliability without external API keys.'
                : 'Connected to live external LLM API service.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              reasoning?.is_mock
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {reasoning?.is_mock ? 'LOCAL MOCK REASONER' : 'REAL AI MODEL'}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-rose-400" />
            <span>EXECUTION BLOCKED (READ-ONLY)</span>
          </span>
        </div>
      </div>

      {/* Top Reasoning KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Stage */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">ASSESSED ATTACK STAGE</span>
            <Crosshair className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{reasoning?.current_attack_stage || 'Discovery'}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <span>Risk Level:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                reasoning?.risk === 'CRITICAL' || reasoning?.risk === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {reasoning?.risk || 'HIGH'}
            </span>
          </p>
        </div>

        {/* Predicted Next Stage */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">PREDICTED NEXT STAGE</span>
            <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{reasoning?.predicted_next_stage || 'Initial Access'}</div>
          <p className="text-xs text-slate-400 mt-1">Forecasted attack progression</p>
        </div>

        {/* Confidence Gauge */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">REASONING CONFIDENCE</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {((reasoning?.confidence || 0.85) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">Probability</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(reasoning?.confidence || 0.85) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* System Command Safety Lock */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">SAFETY GUARANTEE</span>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-emerald-300 font-mono">CANNOT EXECUTE COMMANDS</div>
          <p className="text-xs text-slate-400 mt-2">Read-Only Advisory Output</p>
        </div>
      </div>

      {/* Threat Objectives Score Meters */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-rose-400" />
            <span>Adversary Threat Objectives Score Matrix</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Estimated Target Focus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Objective 1: Credentials */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Credentials Objective</span>
              <span className="text-rose-400 font-bold">{((reasoning?.objectives.credentials || 0.45) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(reasoning?.objectives.credentials || 0.45) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400">Targeting user/admin credentials</p>
          </div>

          {/* Objective 2: Database */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Database Access Objective</span>
              <span className="text-amber-400 font-bold">{((reasoning?.objectives.database || 0.35) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(reasoning?.objectives.database || 0.35) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400">Targeting database exfiltration</p>
          </div>

          {/* Objective 3: Administrative Access */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Administrative Access Objective</span>
              <span className="text-purple-400 font-bold">{((reasoning?.objectives.administrative_access || 0.25) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(reasoning?.objectives.administrative_access || 0.25) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400">Targeting domain escalation</p>
          </div>
        </div>
      </div>

      {/* Main Split: Action Recommendations & Evidence Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Recommendations Grid */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                Recommended Action Plan (PROTECT | MONITOR | DECEIVE)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Advisory Recommendations</span>
          </div>

          <div className="space-y-3 font-mono">
            {reasoning?.actions.map((act, idx) => {
              const cfg = getActionBadgeStyle(act.action);
              const Icon = cfg.icon;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center space-x-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span>{act.target}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border flex items-center space-x-1 ${cfg.badge}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <span>{act.action}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{act.reason}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Attribution List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                Telemetry Evidence Attribution
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Context Correlated</span>
          </div>

          <div className="space-y-3 font-mono">
            {reasoning?.evidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-[10px] font-bold">
                    {ev.feature}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{ev.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
