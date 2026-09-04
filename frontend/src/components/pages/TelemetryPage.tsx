import React, { useState } from 'react';
import { Radio, Filter, Activity, Info, ShieldAlert } from 'lucide-react';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { useRealtime } from '../../context/RealtimeContext';

export interface TelemetryEventItem {
  id: string;
  time: string;
  category: 'NETWORK' | 'AUTH' | 'DATABASE' | 'LOAD_BALANCER' | 'DECEPTION';
  source: string;
  event: string;
  asset: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
}

export const TelemetryPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const events: TelemetryEventItem[] = [
    {
      id: 'evt-1',
      time: '10:42:28',
      category: 'DECEPTION',
      source: '192.168.99.150',
      event: 'Decoy DB Query Captured',
      asset: 'Decoy DB (Port 5433)',
      severity: 'HIGH',
      impact: 'Attacker exfiltration diverted to isolated honey trap.'
    },
    {
      id: 'evt-2',
      time: '10:42:24',
      category: 'LOAD_BALANCER',
      source: 'NGINX Load Balancer',
      event: 'Server B Rerouted',
      asset: 'Server B (10.0.0.11)',
      severity: 'MEDIUM',
      impact: 'Server B capacity throttled to 10% due to risk increase.'
    },
    {
      id: 'evt-3',
      time: '10:42:18',
      category: 'AUTH',
      source: '192.168.99.150',
      event: 'Auth Failure Anomaly Spike',
      asset: 'Auth Service (10.0.0.13)',
      severity: 'CRITICAL',
      impact: 'Triggered PyTorch LSTM lateral movement forecast.'
    },
    {
      id: 'evt-4',
      time: '10:42:05',
      category: 'NETWORK',
      source: '192.168.99.150',
      event: 'SYN Port Scan Burst',
      asset: 'API Gateway (10.0.0.12)',
      severity: 'HIGH',
      impact: 'Initiated MITRE ATT&CK T1595 Reconnaissance stage.'
    }
  ];

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter(e => e.category === selectedCategory);

  const openDrawer = (evt: TelemetryEventItem) => {
    setDrawerData({
      title: `${evt.event} — ${evt.asset}`,
      type: `${evt.category} TELEMETRY EVENT`,
      status: evt.severity,
      summary: `Telemetry event ingested from ${evt.source} targeting ${evt.asset}.`,
      why: evt.impact,
      evidence: [
        `Category: ${evt.category}`,
        `Source Host: ${evt.source}`,
        `Target Asset: ${evt.asset}`,
        `Severity Level: ${evt.severity}`,
        `Timestamp: ${evt.time}`
      ],
      actionApplied: evt.category === 'DECEPTION' ? 'DECEIVE: Honey trap active' : 'MONITOR & LOG',
      result: evt.impact
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Filterable Telemetry Event Stream
            </h1>
            <span className="badge-green">REALTIME INGESTION</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Categorized event stream with interactive model impact drawers
          </p>
        </div>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Telemetry Pipeline Active`}
        where="All Security Layers & Deception Zone"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="Continuous telemetry stream feeds state aggregator S_t and Bayesian objective inference."
        whatNext="Calculating neural state transition matrix on incoming log batch."
      />

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto text-xs">
        {['ALL', 'NETWORK', 'AUTH', 'DATABASE', 'LOAD_BALANCER', 'DECEPTION'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedCategory === cat ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase">Ingested Telemetry Log Stream</span>
          <span className="text-[10px] text-slate-500">Click any row to inspect event impact on AI prediction</span>
        </div>

        <div className="space-y-2">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              onClick={() => openDrawer(evt)}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:border-slate-700 transition-colors text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{evt.time}</span>
                  <span className="badge-orange">{evt.category}</span>
                  <span className="font-bold text-white">{evt.event}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Source: {evt.source} • Target: {evt.asset}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-slate-400 max-w-xs truncate hidden md:block font-sans">
                  {evt.impact}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  evt.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' :
                  evt.severity === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>{evt.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};
