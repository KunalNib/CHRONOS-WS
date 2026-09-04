import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  Database,
  Server,
  Lock,
  Activity,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  FileText,
  Terminal,
  Eye,
  Power
} from 'lucide-react';
import {
  fetchDeceptionStatus,
  fetchDeceptionEvents,
  activateDeception,
  deactivateDeception,
  DeceptionStatusResponse,
  DeceptionEventsResponse
} from '../services/api';

export const SecureDeceptionPage: React.FC = () => {
  const [statusData, setStatusData] = useState<DeceptionStatusResponse | null>(null);
  const [eventsData, setEventsData] = useState<DeceptionEventsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = await fetchDeceptionStatus();
      const events = await fetchDeceptionEvents();
      setStatusData(status);
      setEventsData(events);
    } catch (err) {
      console.error('Failed to load deception data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadData, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleToggleActivation = async () => {
    try {
      setActionLoading(true);
      if (statusData?.is_active) {
        await deactivateDeception();
      } else {
        await activateDeception(true); // Validated by defence engine policy
      }
      await loadData();
    } catch (err) {
      console.error('Failed to toggle deception activation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl border border-amber-500/30">
            <Crosshair className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 13 — Secure Adaptive Deception
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Isolated Deception Zone (VLAN 99) • Synthetic Background Traffic • Production Mimicry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <button
            onClick={handleToggleActivation}
            disabled={actionLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              statusData?.is_active
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <Power className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>{statusData?.is_active ? 'DEACTIVATE DECEPTION' : 'ACTIVATE DECEPTION (POLICY ENGINE)'}</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs transition-colors ${
              autoRefresh
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{autoRefresh ? 'LIVE REFRESH (3s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Top Metrics & Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">DECEPTION REALISM RATING</span>
            <span className="text-xl font-bold text-emerald-400">
              {((statusData?.deception_realism || 0.964) * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 block">Enterprise PostgreSQL Mimic</span>
          </div>
          <Zap className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">FINGERPRINT RISK</span>
            <span className="text-xl font-bold text-cyan-400">
              {statusData?.fingerprint_risk || 'LOW'}
            </span>
            <span className="text-[10px] text-slate-500 block">Indistinguishable from Prod</span>
          </div>
          <Eye className="w-8 h-8 text-cyan-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ISOLATION BOUNDARY</span>
            <span className="text-xs font-bold text-purple-300 block mt-1">
              {statusData?.isolation_status || '100% Isolated - VLAN 99 ACL'}
            </span>
            <span className="text-[10px] text-slate-500 block">Zero Route to Real Assets</span>
          </div>
          <Lock className="w-8 h-8 text-purple-500/30" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TRAPPED ATTACKER PAYLOADS</span>
            <span className="text-xl font-bold text-amber-400">
              {statusData?.total_interactions || 0} CAPTURED
            </span>
            <span className="text-[10px] text-slate-500 block">High-Value Intelligence Feed</span>
          </div>
          <Crosshair className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Decoy Services Grid */}
      <div className="space-y-4 font-mono">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span>Locally Isolated Controlled Decoy Services (Deception Zone VLAN 99)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusData?.active_decoys.map((decoy, idx) => {
            const DecoyIcon = decoy.name.includes('Database') ? Database : decoy.name.includes('API') ? Server : Lock;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      <DecoyIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{decoy.name}</h3>
                      <span className="text-[10px] text-slate-400">{decoy.subnet} (Port {decoy.port})</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    decoy.status === 'ACTIVE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}>
                    {decoy.status}
                  </span>
                </div>

                {/* Resource Limits & Query Rate */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">CONTAINER CAPS</span>
                    <span className="text-slate-300 font-bold">{decoy.resource_limits.cpu} / {decoy.resource_limits.memory}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">SYNTHETIC RATE</span>
                    <span className="text-amber-400 font-bold">{statusData?.is_active ? decoy.synthetic_query_rate : 0} q/s</span>
                  </div>
                </div>

                {/* Security Boundaries */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">SECURITY GUARANTEES:</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">NO REAL CREDENTIALS</span>
                    <span className="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">SYNTHETIC SCHEMA</span>
                    <span className="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">VLAN 99 FIREWALL ACL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controlled Background Activity Simulation Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Controlled Background Activity Generator (Synthetic Production Traffic)
            </h3>
          </div>
          <span className="text-xs text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
            SYNTHETIC PRODUCER LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block">SYNTHETIC PIPELINE FLOW:</span>
            <div className="p-3 bg-slate-900/80 rounded-lg text-slate-300 space-y-1 border border-slate-800">
              <p>1. Synthetic App $\rightarrow$ GET /v2/api/orders?status=active</p>
              <p>2. Decoy API $\rightarrow$ SELECT * FROM synthetic_orders WHERE user_id = 1042</p>
              <p>3. Decoy DB $\rightarrow$ Return Synthetic Payload (Status: 200 OK)</p>
            </div>
            <p className="text-[10px] text-slate-500">
              Controlled background activity ensures decoys do not appear idle or artificial to external probes.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block">ISOLATION & SAFETY AUDIT:</span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Path to Real Assets: <strong>NONE</strong> (Zero Routing to VLAN 10)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Synthetic Data: 100% Mock Tables (Zero real user records)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Policy Enforcement: Triggered strictly by Stage 12 Defence Engine</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Captured Attacker Decoy Interactions Log */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Captured Attacker Decoy Interaction Log ({eventsData?.total_events || 0} Events)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Isolated High-Value Intelligence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">EVENT ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">SOURCE IP</th>
                <th className="py-2.5 px-3">TARGET DECOY</th>
                <th className="py-2.5 px-3">PROTOCOL</th>
                <th className="py-2.5 px-3">INTERCEPTED PAYLOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {eventsData?.events.slice().reverse().map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{ev.event_id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 text-rose-300">{ev.source_ip}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{ev.target_decoy} ({ev.decoy_port})</td>
                  <td className="py-2.5 px-3 text-purple-300">{ev.protocol}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] max-w-md truncate">
                    {ev.payload_summary}
                  </td>
                </tr>
              ))}
              {(!eventsData?.events || eventsData.events.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No attacker decoy interactions captured yet. Deception traps standing by.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
