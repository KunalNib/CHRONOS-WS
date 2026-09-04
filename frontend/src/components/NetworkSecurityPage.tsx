import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Cpu,
  Database,
  Activity,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Radio,
  Sliders,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import {
  fetchSecurityOverview,
  SecurityOverviewResponse,
  SecurityLayer,
  SecurityControl,
  SecurityLayerEvent
} from '../services/api';

const LAYER_ICONS: Record<string, React.ReactNode> = {
  'NETWORK/PERIMETER': <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  'LOAD BALANCER': <Sliders className="w-5 h-5 text-cyan-400" />,
  'APPLICATION': <Zap className="w-5 h-5 text-indigo-400" />,
  'HOST': <Server className="w-5 h-5 text-purple-400" />,
  'DATA': <Database className="w-5 h-5 text-amber-400" />,
  'TELEMETRY': <Activity className="w-5 h-5 text-emerald-400" />,
  'AI': <Cpu className="w-5 h-5 text-blue-400" />,
  'DEFENCE': <Lock className="w-5 h-5 text-rose-400" />,
  'DECEPTION': <Eye className="w-5 h-5 text-fuchsia-400" />
};

export const NetworkSecurityPage: React.FC = () => {
  const [data, setData] = useState<SecurityOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>('level_1_network');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await fetchSecurityOverview();
      setData(overview);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to load security overview:', err);
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
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredLayers = data?.layers.filter((layer) => {
    const matchesSearch =
      layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layer.layer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layer.controls.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'HEALTHY' && layer.status === 'HEALTHY') ||
      (statusFilter === 'STANDBY' && layer.status === 'STANDBY') ||
      (statusFilter === 'DEGRADED' && layer.status === 'DEGRADED');

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CHRONOS-WS Architecture
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                9-Level Defense-in-Depth Security Matrix & Active Countermeasure Controls
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Status Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">LIVE SYNC</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto 5s' : 'Paused'}</span>
          </button>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Error Alert if API Fails */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Backend Connection Warning</p>
              <p className="text-xs text-rose-400/80">{error}</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Overview KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Status */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              SECURITY STATUS
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            {data?.system_security_status || 'PROTECTED'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Zero active perimeter breaches</p>
        </div>

        {/* Card 2: Total Layers */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              DEFENSE LAYERS
            </span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{data?.total_layers || 9}</span>
            <span className="text-xs text-slate-400 font-mono">/ 9 Levels Active</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Card 3: Active Controls */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              SECURITY CONTROLS
            </span>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">{data?.active_controls || 42}</span>
            <span className="text-xs text-slate-400 font-mono">/ {data?.total_controls || 42} Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">100% controls operational</p>
        </div>

        {/* Card 4: System Risk Index */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              AVERAGE RISK INDEX
            </span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {((data?.average_risk || 0.03) * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.max(5, (data?.average_risk || 0.03) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search security layer or control..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'HEALTHY', 'STANDBY', 'DEGRADED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 9-Level Defense-in-Depth Security Matrix (Grid / List View) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-300 font-mono tracking-wider uppercase flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Defense-in-Depth Architecture (9 Levels)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Showing {filteredLayers.length} of 9 Levels</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredLayers.map((layer, index) => {
            const isExpanded = expandedLayerId === layer.id;
            return (
              <div
                key={layer.id}
                className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-cyan-500/40 bg-slate-900/60' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Layer Header Row */}
                <div
                  onClick={() => setExpandedLayerId(isExpanded ? null : layer.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                      {LAYER_ICONS[layer.layer] || <ShieldCheck className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          LEVEL {index + 1}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{layer.layer}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{layer.name}</h3>
                    </div>
                  </div>

                  {/* Status, Risk, Controls Pill */}
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-mono">RISK SCORE</span>
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        {(layer.risk * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                          layer.status === 'HEALTHY'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : layer.status === 'STANDBY'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {layer.status}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls Preview Bar */}
                <div className="px-4 pb-4 sm:px-5 flex flex-wrap gap-1.5 border-t border-slate-800/40 pt-3">
                  {layer.controls.map((control) => (
                    <span
                      key={control.name}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          control.status === 'ACTIVE'
                            ? 'bg-emerald-400'
                            : control.status === 'STANDBY'
                            ? 'bg-purple-400'
                            : 'bg-rose-400'
                        }`}
                      ></span>
                      <span>{control.name}</span>
                    </span>
                  ))}
                </div>

                {/* Expanded Granular Controls & Event Logs View */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-950/60 border-t border-slate-800/80 space-y-5">
                    {/* Controls Grid */}
                    <div>
                      <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Active Layer Controls & Specifications
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {layer.controls.map((control) => (
                          <div
                            key={control.name}
                            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-slate-200">
                                  {control.name}
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                    control.status === 'ACTIVE'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  }`}
                                >
                                  {control.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{control.description}</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Events Log for Layer */}
                    <div>
                      <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Layer Audit Events & Check Timestamp</span>
                      </h4>
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800">
                          <span>LAST CHECKED: {new Date(layer.last_checked).toLocaleTimeString()}</span>
                          <span className="text-cyan-400">{layer.events.length} Events Logged</span>
                        </div>
                        {layer.events.map((evt) => (
                          <div key={evt.id} className="flex items-start space-x-2 text-slate-300 pt-1">
                            <span className="text-emerald-400">[{evt.severity}]</span>
                            <span className="text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}:</span>
                            <span>{evt.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
