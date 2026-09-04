import React, { useState } from 'react';
import { GitCommit, ArrowRight, Activity, ShieldCheck, Crosshair, AlertTriangle } from 'lucide-react';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { useRealtime } from '../../context/RealtimeContext';

export interface AttackPathNode {
  id: string;
  stage: string;
  tactic: string;
  technique: string;
  asset: string;
  status: 'COMPLETED' | 'CURRENT' | 'PREDICTED' | 'BLOCKED' | 'DECEIVED';
  confidence: number;
  evidence: string[];
}

export const AttackPathPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const nodes: AttackPathNode[] = [
    {
      id: 'node-1',
      stage: 'Discovery & Recon',
      tactic: 'TA0043 Reconnaissance',
      technique: 'T1595 Active Scanning',
      asset: 'Edge Firewall (10.0.0.1)',
      status: 'COMPLETED',
      confidence: 1.0,
      evidence: ['Port scan probes on port 80/443', 'External IP 192.168.99.150']
    },
    {
      id: 'node-2',
      stage: 'Initial Access',
      tactic: 'TA0001 Initial Access',
      technique: 'T1190 Exploit Public-Facing App',
      asset: 'API Server 01 (10.0.0.12)',
      status: judgeDemoStep <= 2 ? 'CURRENT' : 'COMPLETED',
      confidence: 0.95,
      evidence: ['HTTP 401 spike', 'Burst SYN packets']
    },
    {
      id: 'node-3',
      stage: 'Credential Access',
      tactic: 'TA0006 Credential Access',
      technique: 'T1078 Valid Accounts',
      asset: 'Auth Service (10.0.0.13)',
      status: judgeDemoStep >= 3 && judgeDemoStep <= 6 ? 'CURRENT' : judgeDemoStep > 6 ? 'COMPLETED' : 'PREDICTED',
      confidence: 0.87,
      evidence: ['12 auth failures / 2.4s', 'Brute force credential spray']
    },
    {
      id: 'node-4',
      stage: 'Lateral Movement',
      tactic: 'TA0008 Lateral Movement',
      technique: 'T1021 Remote Services',
      asset: 'Admin Service (10.0.0.14)',
      status: judgeDemoStep >= 7 && judgeDemoStep <= 8 ? 'CURRENT' : judgeDemoStep > 8 ? 'DECEIVED' : 'PREDICTED',
      confidence: 0.78,
      evidence: ['PyTorch LSTM S_(t+1) temporal forecast', 'East-West gRPC call anomaly']
    },
    {
      id: 'node-5',
      stage: 'Data Collection & Exfiltration',
      tactic: 'TA0010 Exfiltration',
      technique: 'T1041 Exfiltration Over C2',
      asset: 'Adaptive Decoy DB (Port 5433)',
      status: judgeDemoStep >= 9 ? 'DECEIVED' : 'PREDICTED',
      confidence: 0.65,
      evidence: ['Diverted attacker queries trapped in VLAN 99 honeypot', '0 exfiltration to real DB']
    }
  ];

  const getStatusBadge = (status: AttackPathNode['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">COMPLETED ✓</span>;
      case 'CURRENT':
        return <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">CURRENT THREAT ●</span>;
      case 'PREDICTED':
        return <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-full text-xs font-bold">PREDICTED ◌</span>;
      case 'DECEIVED':
        return <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">DECEIVED ★</span>;
      case 'BLOCKED':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">BLOCKED ✕</span>;
    }
  };

  const openDrawer = (node: AttackPathNode) => {
    setDrawerData({
      title: `${node.stage} — ${node.asset}`,
      subtitle: `${node.tactic} (${node.technique})`,
      type: 'ATTACK PATH NODE',
      status: node.status,
      summary: `MITRE ATT&CK node representing ${node.tactic} on ${node.asset}.`,
      why: `Confidence score ${Math.round(node.confidence * 100)}% based on state transition S_t → S_t+1.`,
      evidence: node.evidence,
      actionApplied: node.status === 'DECEIVED' ? 'DECEIVE: Honey trap active' : 'MONITOR & PROTECT',
      result: node.status === 'DECEIVED' ? 'Attacker trapped in Decoy Zone' : 'Observed and logged'
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Attack Path Prediction Graph
            </h1>
            <span className="badge-purple">MITRE ATT&CK MAPPING</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Explicit attack progression graph with evidence drawers & status badges
          </p>
        </div>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Attack Progression Modeled`}
        where="Authentication → Administrative → Database Path"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="MITRE ATT&CK graph maps real-time telemetry anomalies to explicit tactics."
        whatNext="Rerouting lateral movement path into isolated Decoy DB."
      />

      {/* Sequential Attack Path Graph Nodes */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase">Predictive Attack Graph Sequence</span>
          <span className="text-[10px] text-slate-500">Click any node to open the Evidence Drawer</span>
        </div>

        <div className="space-y-3">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div
                onClick={() => openDrawer(node)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  node.status === 'CURRENT'
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30'
                    : node.status === 'DECEIVED'
                    ? 'bg-orange-950/30 border-orange-500/50 shadow-lg shadow-orange-950/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{node.stage}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({node.asset})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{node.tactic} • {node.technique}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-[11px]">
                    <div className="text-slate-400 font-mono">Confidence</div>
                    <div className="font-bold text-purple-300">{Math.round(node.confidence * 100)}%</div>
                  </div>
                  {getStatusBadge(node.status)}
                </div>
              </div>

              {index < nodes.length - 1 && (
                <div className="flex justify-center text-slate-700">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              )}
            </React.Fragment>
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
