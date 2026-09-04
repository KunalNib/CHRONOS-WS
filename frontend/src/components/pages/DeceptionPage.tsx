import React, { useState } from 'react';
import { Crosshair, Lock, ShieldCheck, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { useRealtime } from '../../context/RealtimeContext';

export const DeceptionPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const securityGuarantees = [
    { title: 'Network Isolation', status: 'VERIFIED ✓', desc: 'Isolated on dedicated VLAN 99 subnet' },
    { title: 'Firewall Boundary', status: 'ENFORCED ✓', desc: 'Strict egress filtering blocks out-of-bounds traffic' },
    { title: 'ACL & Access Control', status: 'ACTIVE ✓', desc: 'Deny-all default rule for production subnets' },
    { title: 'Zero Path to Real Assets', status: 'GUARANTEED ✓', desc: 'No routing table entries exist to production DB' },
    { title: 'Resource Limits', status: 'LIMITED ✓', desc: 'Cgroups capped at 512MB RAM & 1 CPU core' },
    { title: 'Synthetic Data', status: 'SYNTHETIC ✓', desc: 'Zero real user credentials or sensitive PII stored' }
  ];

  const attackerLogs = [
    { time: '10:42:28', src: '192.168.99.150', action: 'SELECT * FROM users LIMIT 10', target: 'Decoy DB (Port 5433)', result: 'TRAPPED & LOGGED' },
    { time: '10:42:26', src: '192.168.99.150', action: 'POST /api/v1/admin/login', target: 'Decoy API (Port 8080)', result: 'SYNTHETIC 200 OK' },
    { time: '10:42:24', src: '192.168.99.150', action: 'SYN Port Scan (5433)', target: 'Honey Trap VLAN 99', result: 'HONEYPOT ACK' }
  ];

  const openDrawer = (log: typeof attackerLogs[0]) => {
    setDrawerData({
      title: `Decoy Interaction — ${log.action}`,
      type: 'ATTACKER DECOY TRAP LOG',
      status: log.result,
      summary: `Attacker payload from ${log.src} captured in isolated Decoy Zone.`,
      why: 'Adaptive defence policy diverted lateral movement traffic into honey trap.',
      evidence: [
        `Source IP: ${log.src}`,
        `Query Payload: ${log.action}`,
        `Target Decoy: ${log.target}`,
        `Timestamp: ${log.time}`
      ],
      actionApplied: 'DECEIVE: Synthetic payload capture',
      result: 'ZERO impact on real production database.'
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Crosshair className="w-5 h-5 text-orange-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Adaptive Deception & Honeypot Zone
            </h1>
            <span className="badge-orange">DECEPTION ZONE</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Isolated VLAN 99 honey traps, security isolation guarantees, and attacker exfiltration logging
          </p>
        </div>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Deception Zone ${judgeDemoStep >= 9 ? 'ACTIVE' : 'STANDBY'}`}
        where="VLAN 99 Honeypot (Port 5433)"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="AI identified increasing database objective intent; activated decoy DB exfiltration trap."
        whatNext="Capturing attacker payloads with 0 risk to production PostgreSQL DB."
      />

      {/* HARD VISUAL BOUNDARY: REAL ASSETS vs ISOLATED DECEPTION ZONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real Network Side */}
        <div className="bg-slate-900 border border-emerald-800/40 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <span className="font-bold text-emerald-400 text-xs uppercase flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>REAL PRODUCTION NETWORK</span>
            </span>
            <span className="badge-green">PROTECTED</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">PostgreSQL DB 01</span>
                <span className="text-emerald-400 font-mono">10.0.0.15</span>
              </div>
              <div className="text-[10px] text-slate-400">Status: PROTECTED • Real Customer Data</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Auth Service 01</span>
                <span className="text-emerald-400 font-mono">10.0.0.13</span>
              </div>
              <div className="text-[10px] text-slate-400">Status: PROTECTED • Strict Rate Limits</div>
            </div>
          </div>
        </div>

        {/* Isolated Deception Zone Side */}
        <div className="bg-orange-950/20 border border-orange-500/50 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="border-b border-orange-800/40 pb-3 flex items-center justify-between">
            <span className="font-bold text-orange-400 text-xs uppercase flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-orange-400" />
              <span>ISOLATED DECEPTION ZONE (VLAN 99)</span>
            </span>
            <span className="badge-orange">{judgeDemoStep >= 9 ? 'DECOY ACTIVE' : 'STANDBY'}</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950/90 rounded-2xl border border-orange-500/40 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Adaptive Decoy Database</span>
                <span className="text-orange-400 font-mono">Port 5433</span>
              </div>
              <div className="text-[10px] text-slate-300">Synthetic schema • Trapping queries</div>
            </div>
            <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Adaptive Decoy API</span>
                <span className="text-orange-400 font-mono">Port 8080</span>
              </div>
              <div className="text-[10px] text-slate-300">Synthetic admin endpoints</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deception Security Guarantees */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Deception Security Guarantees</span>
          </span>
          <span className="badge-green">6/6 VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {securityGuarantees.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.title}</span>
                <span className="text-emerald-400 text-[10px] font-bold">{item.status}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Realtime Attacker Interaction Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-orange-400" />
            <span>Trapped Attacker Interaction Logs</span>
          </span>
          <span className="text-[10px] text-slate-500">Click log row for payload drawer</span>
        </div>

        <div className="space-y-2">
          {attackerLogs.map((log, i) => (
            <div
              key={i}
              onClick={() => openDrawer(log)}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:border-slate-700 transition-colors text-xs font-mono"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{log.time}</span>
                  <span className="text-orange-400 font-bold">{log.src}</span>
                  <span className="text-white font-bold">{log.action}</span>
                </div>
                <div className="text-[10px] text-slate-400">Target: {log.target}</div>
              </div>
              <span className="badge-orange">{log.result}</span>
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
