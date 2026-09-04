import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, Crosshair, ArrowRight, Layers, Sliders } from 'lucide-react';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { useRealtime } from '../../context/RealtimeContext';
import { RoleGuard } from '../auth/RoleGuard';

export const DefencePage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const actions = [
    {
      target: 'Auth Service (10.0.0.13)',
      action: 'PROTECT',
      reason: 'Credential Harvesting intent rose to 78%',
      status: 'ACTIVE',
      lifecycle: 'APPROVED → EXECUTING → ACTIVE',
      result: 'Rate limits enforced; credential spray contained'
    },
    {
      target: 'API Gateway (10.0.0.12)',
      action: 'MONITOR',
      reason: 'Port scan probes detected',
      status: 'ACTIVE',
      lifecycle: 'APPROVED → EXECUTING → ACTIVE',
      result: 'Deep packet logging active'
    },
    {
      target: 'PostgreSQL DB (10.0.0.15)',
      action: 'DECEIVE',
      reason: 'Database Objective probability = 25%; exfiltration risk',
      status: judgeDemoStep >= 9 ? 'ACTIVE' : 'RECOMMENDED',
      lifecycle: judgeDemoStep >= 9 ? 'APPROVED → EXECUTING → ACTIVE' : 'RECOMMENDED',
      result: judgeDemoStep >= 9 ? 'Attacker traffic diverted to isolated Decoy DB (Port 5433)' : 'Standby for trigger'
    }
  ];

  const openDrawer = (act: typeof actions[0]) => {
    setDrawerData({
      title: `${act.action} — ${act.target}`,
      type: 'DEFENCE ACTION',
      status: act.status,
      summary: `Adaptive defence action ${act.action} enforced on ${act.target}.`,
      why: act.reason,
      evidence: [
        `Action Type: ${act.action}`,
        `Lifecycle Stage: ${act.lifecycle}`,
        `Target Asset: ${act.target}`
      ],
      actionApplied: act.action,
      result: act.result
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Adaptive Defence & Policy Engine
            </h1>
            <span className="badge-green">POLICY VALIDATED</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Multi-action decision engine (PROTECT, MONITOR, DECEIVE) with explicit lifecycle states
          </p>
        </div>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Adaptive Defence Enforced`}
        where="Authentication, Load Balancer & Deception Zone"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="Policy Validation Engine verified LLM decision against 9 security boundary rules."
        whatNext="Enforcing honeypot redirection on isolated VLAN 99."
      />

      {/* Decision Pipeline Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase">Adaptive Defence Pipeline Flow</span>
          <span className="text-[10px] text-slate-500">6-Stage Decision Sequence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">1. RISK</div>
            <div className="font-bold text-rose-400">{currentDemoStepData.risk}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">2. PATH</div>
            <div className="font-bold text-amber-400">Creds → DB</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">3. OBJECTIVE</div>
            <div className="font-bold text-orange-400">Creds (78%)</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">4. SECURITY</div>
            <div className="font-bold text-blue-400">9 Layers</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">5. LOAD</div>
            <div className="font-bold text-purple-400">Server B (10%)</div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">6. DECISION</div>
            <div className="font-bold text-white">PROTECT + DECEIVE</div>
          </div>
        </div>
      </div>

      {/* Active Actions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase">Active Defence Actions & Execution Lifecycle</span>
          <span className="badge-green">EXECUTING</span>
        </div>

        <div className="space-y-3">
          {actions.map((act, i) => (
            <div
              key={i}
              onClick={() => openDrawer(act)}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                    act.action === 'PROTECT' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    act.action === 'MONITOR' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-orange-500 text-white'
                  }`}>{act.action}</span>
                  <span className="text-xs font-bold text-white">{act.target}</span>
                </div>
                <span className="badge-green">{act.status}</span>
              </div>
              <div className="text-xs text-slate-300 font-sans">{act.reason}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-2">
                <span>Lifecycle: {act.lifecycle}</span>
                <span className="text-emerald-400 font-bold">Result: {act.result}</span>
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
