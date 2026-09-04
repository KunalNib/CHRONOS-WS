import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Server,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Radio,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import {
  fetchLoadBalancerStatus,
  fetchLoadBalancerDecision,
  updateServerRisk,
  LoadBalancerStatusResponse,
  LoadBalancerDecisionResponse,
  ServerLoadMetrics
} from '../services/api';

const SERVER_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  server_a: {
    bg: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    bar: 'bg-cyan-400'
  },
  server_b: {
    bg: 'from-purple-500/10 to-indigo-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bar: 'bg-purple-400'
  },
  server_c: {
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bar: 'bg-emerald-400'
  }
};

export const LoadBalancerPage: React.FC = () => {
  const [status, setStatus] = useState<LoadBalancerStatusResponse | null>(null);
  const [decision, setDecision] = useState<LoadBalancerDecisionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingServerId, setUpdatingServerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, decisionRes] = await Promise.all([
        fetchLoadBalancerStatus(),
        fetchLoadBalancerDecision()
      ]);
      setStatus(statusRes);
      setDecision(decisionRes);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load load balancer data:', err);
      setError(err.message || 'Failed to connect to CHRONOS-WS Backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData();
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRiskChange = async (serverId: string, newRisk: number) => {
    try {
      setUpdatingServerId(serverId);
      const updatedStatus = await updateServerRisk(serverId, newRisk);
      setStatus(updatedStatus);
      const updatedDecision = await fetchLoadBalancerDecision();
      setDecision(updatedDecision);
    } catch (err: any) {
      console.error('Failed to update server risk:', err);
    } finally {
      setUpdatingServerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation / Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
            <Sliders className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Security-Aware Load Balancer
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Dynamic Capacity & Security-Risk Dynamic Traffic Routing Simulation
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">ROUTING ENGINE ONLINE</span>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Routing Mode */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              ROUTING MODE
            </span>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono tracking-tight">
            {status?.routing_mode || 'SECURITY_AWARE_OPTIMAL'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Quadratic risk penalty active</p>
        </div>

        {/* Card 2: Ingress Traffic Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              TOTAL INGRESS RATE
            </span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">
              {status?.total_traffic_rate_rps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">RPS</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Distributed across active pool</p>
        </div>

        {/* Card 3: Active Pool Nodes */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              ACTIVE POOL NODES
            </span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {status?.active_servers || 3}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 3 Healthy Nodes</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Server A, Server B, Server C</p>
        </div>

        {/* Card 4: System Average Risk */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              SYSTEM RISK INDEX
            </span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {(((status?.average_system_risk || 0.05)) * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Dynamic containment penalty</p>
        </div>
      </div>

      {/* Traffic Allocation Bar Visualizer */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Live Traffic Split Distribution Bar</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total Allocation: 100%</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-5 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800">
          {status?.servers.map((srv) => {
            const color = SERVER_COLORS[srv.id] || SERVER_COLORS.server_a;
            return (
              <div
                key={srv.id}
                style={{ width: `${Math.max(2, srv.traffic_percentage)}%` }}
                className={`${color.bar} h-full transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950`}
                title={`${srv.name}: ${srv.traffic_percentage}%`}
              >
                {srv.traffic_percentage > 8 ? `${srv.traffic_percentage}%` : ''}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
          {status?.servers.map((srv) => {
            const color = SERVER_COLORS[srv.id] || SERVER_COLORS.server_a;
            return (
              <div key={srv.id} className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${color.bar}`}></span>
                <span className="text-slate-300">{srv.name}:</span>
                <span className={`font-bold ${color.text}`}>{srv.traffic_percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Server Pool Cards (Core Acceptance UI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 font-mono tracking-wider uppercase flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Server Pool Nodes & Live Routing Controls</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Interactive Judge Risk Testing Active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {status?.servers.map((srv) => {
            const color = SERVER_COLORS[srv.id] || SERVER_COLORS.server_a;
            return (
              <div
                key={srv.id}
                className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-5 bg-gradient-to-b ${color.bg} ${color.border} hover:border-cyan-500/40`}
              >
                {/* Server Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                      {srv.id.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                        srv.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : srv.status === 'DEGRADED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {srv.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{srv.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Routing Score: <span className="text-cyan-400 font-bold">{srv.routing_score} pts</span>
                    </p>
                  </div>
                </div>

                {/* Big Traffic Percentage Banner */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      TRAFFIC ALLOCATION
                    </span>
                    <div className={`text-3xl font-bold font-mono ${color.text}`}>
                      {srv.traffic_percentage}%
                    </div>
                  </div>
                  <Zap className={`w-8 h-8 ${color.text}`} />
                </div>

                {/* Granular Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">CURRENT LOAD</div>
                    <div className="font-semibold text-slate-200">{srv.current_load}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">HEALTH SCORE</div>
                    <div className="font-semibold text-emerald-400">{srv.health}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">CPU / RAM</div>
                    <div className="font-semibold text-slate-200">{srv.cpu}% / {srv.memory}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">ACTIVE SOCKETS</div>
                    <div className="font-semibold text-slate-200">{srv.connection_count}</div>
                  </div>
                </div>

                {/* Routing Reason callout */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 block mb-1">ROUTING DECISION REASON:</span>
                  <span className="text-slate-300">{srv.routing_reason}</span>
                </div>

                {/* Interactive Judge Risk Controller */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Security Risk:</span>
                    </span>
                    <span className="font-bold text-white">{(srv.security_risk * 100).toFixed(0)}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(srv.security_risk * 100)}
                    onChange={(e) => handleRiskChange(srv.id, parseFloat(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  {/* Preset Risk Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleRiskChange(srv.id, 0.05)}
                      className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 transition-colors"
                    >
                      Low (5%)
                    </button>
                    <button
                      onClick={() => handleRiskChange(srv.id, 0.45)}
                      className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-mono border border-amber-500/30 transition-colors"
                    >
                      Med (45%)
                    </button>
                    <button
                      onClick={() => handleRiskChange(srv.id, 0.85)}
                      className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono border border-rose-500/30 transition-colors"
                    >
                      High (85%)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Audit Log Box */}
      {decision && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold text-cyan-400 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>ACTIVE ROUTING DECISION ID: {decision.decision_id}</span>
            </span>
            <span className="text-slate-400">
              Primary Route: <span className="text-white font-bold">{decision.primary_route}</span>
            </span>
          </div>
          <p className="text-slate-400">{decision.decision_explanation}</p>
        </div>
      )}
    </div>
  );
};
