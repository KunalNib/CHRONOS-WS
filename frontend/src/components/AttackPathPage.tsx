import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Server,
  Database,
  Crosshair,
  Sparkles,
  Layers,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  fetchAttackPathCurrent,
  fetchAttackPathPrediction,
  AttackPath,
  AttackPathNode,
  AttackStagePrediction
} from '../services/api';

export const AttackPathPage: React.FC = () => {
  const [attackPath, setAttackPath] = useState<AttackPath | null>(null);
  const [prediction, setPrediction] = useState<AttackStagePrediction | null>(null);
  const [selectedNode, setSelectedNode] = useState<AttackPathNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadAttackPathData = async () => {
    try {
      setLoading(true);
      const [pathRes, predRes] = await Promise.all([
        fetchAttackPathCurrent(),
        fetchAttackPathPrediction()
      ]);
      setAttackPath(pathRes.attack_path);
      setPrediction(predRes.prediction);
      
      // Auto-select active node if no node is selected yet
      if (!selectedNode && pathRes.attack_path?.nodes) {
        const active = pathRes.attack_path.nodes.find(n => n.status === 'ACTIVE') || pathRes.attack_path.nodes[0];
        setSelectedNode(active);
      }
    } catch (err) {
      console.error('Failed to load attack path prediction:', err);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttackPathData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadAttackPathData, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getNodeStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          card: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400'
        };
      case 'ACTIVE':
        return {
          card: 'bg-gradient-to-b from-purple-950/50 to-rose-950/50 border-rose-500/60 shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/30',
          badge: 'bg-rose-500/30 text-rose-300 border-rose-500/50 animate-pulse',
          icon: Crosshair,
          iconColor: 'text-rose-400 animate-spin-slow'
        };
      case 'PREDICTED':
        return {
          card: 'bg-amber-950/30 border-amber-500/50 text-amber-300 hover:border-amber-400 border-dashed',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Sparkles,
          iconColor: 'text-amber-400 animate-pulse'
        };
      default: // POTENTIAL
        return {
          card: 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: Lock,
          iconColor: 'text-slate-500'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-500/20 via-rose-500/20 to-amber-500/20 rounded-xl border border-rose-500/30">
            <GitCommit className="w-6 h-6 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 8 — AI Attack-Path Prediction & Progression
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Dynamic MITRE ATT&CK Graph Engine Correlating Live Telemetry & Stage 7 LSTM World Model Predictions
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
            <span>{autoRefresh ? 'PREDICTION LOOP ACTIVE (3s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={loadAttackPathData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Stage Prediction Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Stage */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">CURRENT ATTACK STAGE</span>
            <Crosshair className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{prediction?.current_stage || 'Discovery'}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <span>Risk Level:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                prediction?.risk === 'CRITICAL' || prediction?.risk === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {prediction?.risk || 'HIGH'}
            </span>
          </p>
        </div>

        {/* Predicted Next Stage */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">PREDICTED NEXT STAGE</span>
            <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{prediction?.predicted_next_stage || 'Initial Access'}</div>
          <p className="text-xs text-slate-400 mt-1">Imminent progression target</p>
        </div>

        {/* Confidence Gauge */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">PREDICTION CONFIDENCE</span>
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {((prediction?.confidence || 0.85) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">LSTM Score</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(prediction?.confidence || 0.85) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* World Model Metadata */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">WORLD MODEL ENGINE</span>
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-amber-300 font-mono truncate">
            {prediction?.model_version || 'v1.0.0 [SYNTHETIC DEMO MODEL]'}
          </div>
          <p className="text-xs text-slate-400 mt-2">Correlated with 10s state history</p>
        </div>
      </div>

      {/* Main Interactive Graph & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Path Interactive Graph (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                MITRE ATT&CK Interactive Progression Graph
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span className="text-slate-400">Completed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span><span className="text-slate-400">Active</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span className="text-slate-400">Predicted</span></span>
            </div>
          </div>

          {/* Flowchart Node Graph Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {attackPath?.nodes.map((node) => {
              const cfg = getNodeStatusStyle(node.status);
              const Icon = cfg.icon;
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${cfg.card} ${
                    isSelected ? 'ring-2 ring-cyan-400 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${cfg.badge}`}>
                      {node.status}
                    </span>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-mono text-white">{node.label}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{node.tactic}</p>
                    {node.technique && (
                      <span className="inline-block text-[10px] text-cyan-300 font-mono bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded mt-1">
                        {node.technique}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Target: <span className="text-slate-200">{node.asset_id}</span></span>
                    <span>Risk: <span className={node.risk_score > 0.4 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{(node.risk_score * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Future Progression Chain Timeline */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-purple-400" />
              <span>Full Predicted Progression Chain</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center space-x-1">
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                <span>{prediction?.current_stage}</span>
              </span>

              <ArrowRight className="w-4 h-4 text-slate-500" />

              <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{prediction?.predicted_next_stage}</span>
              </span>

              {prediction?.future_stages.map((stg, i) => (
                <React.Fragment key={stg}>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                    {stg}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer (1 Col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Info className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Attack Step Evidence Inspector
            </h2>
          </div>

          {selectedNode ? (
            <div className="space-y-5 font-mono">
              <div>
                <span className="text-xs text-slate-400">STAGE LABEL</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedNode.label}</h3>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Status: {selectedNode.status}
                </span>
              </div>

              <div className="space-y-3 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">MITRE Tactic:</span>
                  <span className="text-slate-200 font-semibold">{selectedNode.tactic}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">MITRE Technique:</span>
                  <span className="text-cyan-300 font-semibold">{selectedNode.technique || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Target Asset:</span>
                  <span className="text-slate-200 font-semibold">{selectedNode.asset_id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Stage Risk Score:</span>
                  <span className={selectedNode.risk_score > 0.4 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {(selectedNode.risk_score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Telemetry Evidence:</span>
                  <span className="text-amber-300 font-semibold">{selectedNode.evidence_count} Events</span>
                </div>
              </div>

              {/* Affected Assets Card */}
              <div className="space-y-2">
                <h4 className="text-xs text-slate-400 uppercase tracking-wider">Potentially Affected Assets</h4>
                <div className="space-y-2">
                  {prediction?.affected_assets.map((asset) => (
                    <div
                      key={asset}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-200">{asset}</span>
                      </div>
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        AT RISK
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Click any node in the attack progression graph to inspect MITRE ATT&CK evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
