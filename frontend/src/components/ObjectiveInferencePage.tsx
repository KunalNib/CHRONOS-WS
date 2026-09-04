import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  History,
  ShieldAlert,
  Database,
  Key,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  fetchObjectivesCurrent,
  fetchObjectivesHistory,
  ObjectivesCurrentResponse,
  ObjectivesHistoryResponse,
  ObjectiveItemDetail
} from '../services/api';

export const ObjectiveInferencePage: React.FC = () => {
  const [currentObjectives, setCurrentObjectives] = useState<ObjectivesCurrentResponse | null>(null);
  const [historyData, setHistoryData] = useState<ObjectivesHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadObjectivesData = async () => {
    try {
      setLoading(true);
      const current = await fetchObjectivesCurrent();
      const history = await fetchObjectivesHistory();
      setCurrentObjectives(current);
      setHistoryData(history);
    } catch (err) {
      console.error('Failed to load objective inference data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjectivesData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadObjectivesData, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getObjectiveMeta = (objectiveName: string) => {
    switch (objectiveName) {
      case 'credentials':
        return {
          title: 'Credential Harvesting',
          description: 'Attempts to capture user/admin credentials via brute force or spray',
          icon: Key,
          color: 'from-rose-500 to-red-600',
          textColor: 'text-rose-400',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'database':
        return {
          title: 'Database Access & Exfiltration',
          description: 'Attempts to access SQL tables or query decoy honeypots for data exfiltration',
          icon: Database,
          color: 'from-amber-500 to-orange-600',
          textColor: 'text-amber-400',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'administrative_access':
        return {
          title: 'Administrative Access & Escalation',
          description: 'Attempts to achieve root/admin takeover and lateral movement',
          icon: Lock,
          color: 'from-purple-500 to-indigo-600',
          textColor: 'text-purple-400',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      default:
        return {
          title: objectiveName,
          description: 'Estimated adversary objective hypothesis',
          icon: Target,
          color: 'from-cyan-500 to-blue-600',
          textColor: 'text-cyan-400',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
    }
  };

  const renderDeltaBadge = (change: number) => {
    if (change > 0.001) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-rose-400" />
          <span>+{(change * 100).toFixed(1)}%</span>
        </span>
      );
    } else if (change < -0.001) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
          <TrendingDown className="w-3 h-3 text-emerald-400" />
          <span>{(change * 100).toFixed(1)}%</span>
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
          <Minus className="w-3 h-3 text-slate-500" />
          <span>0.0%</span>
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 via-rose-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
            <Target className="w-6 h-6 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 10 — Multi-Hypothesis Objective Inference Engine
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Bayesian Multi-Hypothesis Goal Estimation & Evidence Attribution
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
            <span>{autoRefresh ? 'INFERENCE LOOP (3s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={loadObjectivesData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Primary Card with Explicit Mandatory Label: "Estimated Attacker Objectives" */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              CHRONOS-WS INTELLIGENCE PLANE
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <Target className="w-5 h-5 text-rose-400" />
              <span>Estimated Attacker Objectives</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>PRIMARY FOCUS: {currentObjectives?.primary_objective.toUpperCase() || 'CREDENTIALS'}</span>
            </span>
          </div>
        </div>

        {/* Explanation Summary */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 font-mono text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p>{currentObjectives?.explanation || 'Estimating adversary hypotheses distribution based on live telemetry evidence.'}</p>
        </div>

        {/* Multi-Hypothesis Objective Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {currentObjectives?.objectives.map((item, idx) => {
            const meta = getObjectiveMeta(item.objective);
            const Icon = meta.icon;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${meta.color} bg-opacity-20 border border-slate-700`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{meta.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{meta.description}</p>
                    </div>
                  </div>
                </div>

                {/* Probability & Delta Display */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Current Probability</span>
                      <div className={`text-2xl font-bold ${meta.textColor}`}>
                        {(item.current_probability * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Previous: {(item.previous_probability * 100).toFixed(1)}%</span>
                      <div className="mt-1">{renderDeltaBadge(item.change)}</div>
                    </div>
                  </div>

                  {/* Meter Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${meta.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.current_probability * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Evidence Attribution */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Correlated Evidence ({item.evidence.length})
                  </span>

                  <ul className="space-y-1.5">
                    {item.evidence.map((ev, evIdx) => (
                      <li key={evIdx} className="text-xs text-slate-300 flex items-start space-x-1.5">
                        <span className="text-cyan-400 font-bold mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Probability Distribution History Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Objective Probability Evolution History ({historyData?.total_snapshots || 0} Snapshots)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Non-Collapsing Temporal Sequence</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {historyData?.history.slice().reverse().map((snap, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-slate-500 font-mono text-[10px]">
                  #{historyData.history.length - idx}
                </span>
                <span className="text-slate-400">
                  {new Date(snap.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] font-bold">
                  PRIMARY: {snap.primary_objective.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {snap.objectives.map((obj, oIdx) => (
                  <div key={oIdx} className="flex items-center space-x-1.5">
                    <span className="text-slate-400 text-[10px] capitalize">{obj.objective.slice(0, 4)}:</span>
                    <span className="font-bold text-white">{(obj.current_probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
