import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  RefreshCw,
  Clock,
  Database,
  ShieldAlert,
  Server,
  Layers,
  Cpu,
  Lock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardDrive
} from 'lucide-react';
import {
  fetchRecentTelemetry,
  fetchTelemetryStats,
  fetchNetworkStates,
  fetchLatestNetworkState,
  CanonicalTelemetryEvent,
  TelemetryStatsResponse,
  FullNetworkState
} from '../services/api';

const SOURCE_ICONS: Record<string, { label: string; icon: any; color: string }> = {
  network_flows: { label: 'Network Flows', icon: Activity, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  authentication_events: { label: 'Auth Events', icon: Lock, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  application_api_logs: { label: 'App / API Logs', icon: Zap, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  host_metrics: { label: 'Host Metrics', icon: Cpu, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  database_events: { label: 'Database Events', icon: Database, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  ids_ips_events: { label: 'IDS / IPS Events', icon: ShieldAlert, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  load_balancer_events: { label: 'Load Balancer', icon: Layers, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' }
};

export const TelemetryPipelinePage: React.FC = () => {
  const [events, setEvents] = useState<CanonicalTelemetryEvent[]>([]);
  const [stats, setStats] = useState<TelemetryStatsResponse | null>(null);
  const [states, setStates] = useState<FullNetworkState[]>([]);
  const [latestState, setLatestState] = useState<FullNetworkState | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes, statesRes, latestRes] = await Promise.all([
        fetchRecentTelemetry(50, selectedSource || undefined),
        fetchTelemetryStats(),
        fetchNetworkStates(15),
        fetchLatestNetworkState()
      ]);
      setEvents(eventsRes);
      setStats(statsRes);
      setStates(statesRes.states);
      setLatestState(latestRes);
    } catch (err) {
      console.error('Failed to load telemetry pipeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
    const interval = setInterval(loadPipelineData, 3000);
    return () => clearInterval(interval);
  }, [selectedSource]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Continuous Telemetry Pipeline & State Transitions
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Real-Time Ingestion, 10s Time-Window Aggregation & Sequential NetworkState (S1 → S2 → S3 → S4)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">INGESTION STREAM ACTIVE</span>
          </div>

          <button
            onClick={loadPipelineData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Pipeline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingestion EPS */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">INGESTION RATE</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">{stats?.ingestion_rate_eps || 12.5}</span>
            <span className="text-xs text-slate-400 font-mono">EPS</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Events per second normalized</p>
        </div>

        {/* Card 2: Total Events Ingested */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">TOTAL BUFFERED EVENTS</span>
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.total_events || 0}</div>
          <p className="text-xs text-slate-400 mt-1">Across 7 canonical sources</p>
        </div>

        {/* Card 3: Active Time-Window */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">TIME WINDOW</span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">10 SECONDS</div>
          <p className="text-xs text-slate-400 mt-1">Rolling state aggregation window</p>
        </div>

        {/* Card 4: Current State ID */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">CURRENT STATE S_t</span>
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{latestState?.state_id || 'S1'}</span>
            <span className="text-xs text-slate-400 font-mono">Sequence #{latestState?.transition_sequence || 1}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Threat Level: <span className="text-slate-200 font-semibold">{latestState?.active_threat_level || 'LOW'}</span></p>
        </div>
      </div>

      {/* Sequential State Transition Chain (Core Acceptance UI) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span>Continuous NetworkState Transition Sequence (S1 → S2 → S3 → S4)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Monotonic State Evolution</span>
        </div>

        {/* Node Chain */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center space-x-3 min-w-max">
            {states.map((st, idx) => {
              const isLatest = idx === states.length - 1;
              return (
                <React.Fragment key={st.state_id}>
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 min-w-[130px] transition-all ${
                      isLatest
                        ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-base font-bold font-mono ${isLatest ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {st.state_id}
                      </span>
                      {isLatest && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                    </div>

                    <div className="text-[10px] font-mono text-slate-400">
                      Seq #{st.transition_sequence}
                    </div>

                    <div className="text-xs font-mono font-semibold text-slate-300">
                      Risk: <span className={st.security_risk > 0.4 ? 'text-rose-400' : 'text-emerald-400'}>
                        {(st.security_risk * 100).toFixed(0)}%
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-center border ${
                        st.active_threat_level === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : st.active_threat_level === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {st.active_threat_level}
                    </span>
                  </div>

                  {idx < states.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 Telemetry Sources Breakdown Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span>7 Canonical Telemetry Ingestion Sources</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(SOURCE_ICONS).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = stats?.events_per_source[key] || 0;
            const isSelected = selectedSource === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedSource(isSelected ? '' : key)}
                className={`p-3 rounded-xl border font-mono text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${cfg.color.split(' ')[0]}`} />
                  <span className="text-[10px] text-slate-400">LIVE</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{cfg.label}</div>
                <div className="text-lg font-bold text-white">{count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Event Stream Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Live Normalized Telemetry Event Buffer ({events.length})
            </h3>
          </div>

          {selectedSource && (
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Filtering by source:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">
                {selectedSource}
              </span>
              <button
                onClick={() => setSelectedSource('')}
                className="text-slate-400 hover:text-white underline ml-1"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">SOURCE</th>
                <th className="py-2.5 px-3">EVENT TYPE</th>
                <th className="py-2.5 px-3">ASSET ID</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">FEATURES & METADATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => {
                const sourceConfig = SOURCE_ICONS[evt.source] || SOURCE_ICONS.network_flows;
                return (
                  <tr key={evt.event_id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${sourceConfig.color}`}>
                        {evt.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{evt.event_type}</td>
                    <td className="py-2.5 px-3 text-slate-400">{evt.asset_id}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : evt.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                      {JSON.stringify(evt.features || evt.metadata || {})}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
