import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Brain,
  Crosshair,
  ShieldCheck,
  Server,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Zap,
  HelpCircle,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { DEMO_NODES, NetworkNodeData } from '../../services/demoDataProvider';
import { CurrentSituation } from '../common/CurrentSituation';
import { LiveDefenceStory } from '../common/LiveDefenceStory';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { RoleGuard } from '../auth/RoleGuard';

export const DashboardPage: React.FC = () => {
  const {
    judgeDemoActive,
    judgeDemoStep,
    currentDemoStepData,
    startJudgeDemo,
    stopJudgeDemo,
    resetJudgeDemo,
    triggerDeterministicDemo
  } = useRealtime();

  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(DEMO_NODES[5]);
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const openNodeDrawer = (node: NetworkNodeData) => {
    setSelectedNode(node);
    setDrawerData({
      title: node.name,
      subtitle: `${node.type} (${node.ip}) — ${node.role}`,
      type: node.type,
      status: node.status,
      summary: `Detailed Assessment for ${node.name}: The node is currently operating under ${node.status} state. Production services remain fully operational and isolated from unauthorized access.`,
      why: node.status === 'HIGH_RISK'
        ? 'Multiple failed authentication attempts detected in short succession along with suspicious port scanning probes.'
        : node.isDecoy
        ? 'Decoy DB environment running on isolated VLAN 99 to capture exfiltration queries.'
        : 'Nominal operational user traffic without security anomalies.',
      evidence: [
        `Node Role: ${node.role}`,
        `IP Address: ${node.ip}`,
        `Operational Status: ${node.status}`,
        `Security Zone: ${node.isDecoy ? 'Isolated Deception Zone (VLAN 99)' : 'Production Subnet'}`
      ],
      actionApplied: node.status === 'HIGH_RISK' ? 'PROTECT: Rate Limiting & Auth Lockdown Enforced' : 'MONITOR: Deep Telemetry Ingestion',
      result: node.status === 'HIGH_RISK' ? 'Authentication anomaly contained; 0 credential leaks.' : 'Normal traffic throughput.'
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header & Deterministic Trigger Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Security Operations Command Center
            </h1>
            <span className="badge-orange">LIVE DEFENCE STORY</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Scenario: Credential-to-Database Adaptive Defence (Repeatable Fixed Seed: 42)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => triggerDeterministicDemo(42)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-orange-950/50 hover:scale-105"
            title="Triggers repeatable 11-phase Credential-to-Database scenario with seed=42"
          >
            <Zap className="w-4 h-4 fill-current text-amber-200" />
            <span>TRIGGER DETERMINISTIC DEMO</span>
          </button>

          {judgeDemoActive ? (
            <button
              onClick={stopJudgeDemo}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <PauseIcon className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={startJudgeDemo}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>RESUME</span>
            </button>
          )}

          <button
            onClick={resetJudgeDemo}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Reset Scenario to Phase 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 1: WHAT IS HAPPENING NOW? (Detailed Plain-Language Card) */}
      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: ${currentDemoStepData.title}`}
        where="Auth Service & API Gateway (10.0.0.13)"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why={currentDemoStepData.description}
        whatNext={`AI World Model forecasts high-probability lateral movement toward Administrative & Database services within the next 30 to 60 seconds.`}
        affectedAssets={['AUTH-SERVER-01', 'API-GATEWAY-01', 'POSTGRES-DB-01']}
      />

      {/* SECTION 1.B: QUALITATIVE SYSTEM STATUS SUMMARY (Detailed Answers, Less Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>CURRENT THREAT STATUS</span>
          </div>
          <div className="text-sm font-extrabold text-rose-300 font-mono">
            {currentDemoStepData.risk === 'CRITICAL' || currentDemoStepData.risk === 'HIGH'
              ? 'ACTIVE ATTACK DETECTED'
              : 'ELEVATED OBSERVED RISK'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Authentication failure spikes and suspicious host probes indicate active adversary recon targeting credentials.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center space-x-1">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>AI PREDICTED NEXT STEP</span>
          </div>
          <div className="text-sm font-extrabold text-purple-300 font-mono">
            {currentDemoStepData.predictedStage.toUpperCase()}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Neural LSTM model forecasts high likelihood of adversary lateral movement targeting database assets.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center space-x-1">
            <Crosshair className="w-3.5 h-3.5 text-orange-400" />
            <span>SYSTEM DEFENCE RESPONSE</span>
          </div>
          <div className="text-sm font-extrabold text-orange-300 font-mono">
            {currentDemoStepData.deceptionActive ? 'HONEYPOT TRAP ACTIVE' : 'RATE LIMITING ENFORCED'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Attacker queries diverted into isolated VLAN 99 Decoy DB; production database remains 100% safe.
          </p>
        </div>
      </div>

      {/* SECTION 2 & 3: WHAT DOES AI PREDICT? + DETAILED WHY EXPLANATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Topology Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden bg-canvas-dark">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white text-xs uppercase">Live Enterprise Network Topology</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Click any node to inspect detailed state</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 relative z-10 font-mono">
            {DEMO_NODES.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => openNodeDrawer(node)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-105 select-none ${
                    node.isDecoy
                      ? 'bg-orange-950/30 border-orange-500/50 shadow-lg shadow-orange-950/40'
                      : isSelected
                      ? 'bg-slate-800 border-orange-500 shadow-xl'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 truncate">{node.type}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      node.status === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400' :
                      node.status === 'SUSPICIOUS' ? 'bg-amber-950 text-amber-400' :
                      node.status === 'HIGH_RISK' ? 'bg-rose-950 text-rose-400' : 'bg-orange-950 text-orange-400'
                    }`}>{node.status}</span>
                  </div>
                  <div className="font-bold text-white text-xs mt-1 truncate">{node.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">{node.ip}</div>
                </div>
              );
            })}
          </div>

          {selectedNode && (
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="font-bold text-white">{selectedNode.name}</span>
                <span className="text-[10px] text-slate-400 font-mono ml-2">({selectedNode.ip})</span>
              </div>
              <button
                onClick={() => openNodeDrawer(selectedNode)}
                className="px-2.5 py-1 bg-orange-600/20 text-orange-400 border border-orange-500/40 hover:bg-orange-600/30 rounded-lg text-[10px] font-bold"
              >
                INSPECT NODE DETAILS
              </button>
            </div>
          )}
        </div>

        {/* AI World Model Forecast & Detailed Answers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white text-xs uppercase">AI THREAT FORECAST DETAILED ANSWER</span>
            </div>
          </div>

          <div className="space-y-3 my-auto font-sans">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Observed Attack Stage</div>
              <div className="font-bold text-slate-200 text-xs font-mono">{currentDemoStepData.attackStage}</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Adversary is currently attempting authentication anomalies and credential harvesting on Auth Service 01.
              </p>
            </div>

            <div className="flex justify-center text-purple-400">
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-1">
              <div className="text-[10px] text-purple-400 font-mono uppercase font-bold flex items-center justify-between">
                <span>Predicted Next Stage</span>
                <span className="badge-purple">HIGH CONFIDENCE</span>
              </div>
              <div className="font-bold text-purple-200 text-sm font-mono">{currentDemoStepData.predictedStage}</div>
              <p className="text-[11px] text-purple-300 leading-snug">
                PyTorch neural LSTM model forecasts lateral movement toward database services within 30 to 60 seconds.
              </p>
            </div>
          </div>

          {/* DETAILED WHY EXPLANATION */}
          <div className="p-3 bg-amber-950/20 rounded-2xl border border-amber-800/40 text-xs space-y-1 font-sans">
            <div className="text-amber-400 font-mono font-bold uppercase flex items-center space-x-1 text-[10px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Detailed Reason for Prediction</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              1. Authentication failure rate exceeded 12 attempts / 2.4s.<br />
              2. SYN port scanning burst detected on API Gateway.<br />
              3. East-West inter-host communication anomaly observed.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: ESTIMATED ATTACKER OBJECTIVES & DEFENCE DECISION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* SECTION 4: Estimated Attacker Objectives (Descriptive Statuses) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs font-mono uppercase">ESTIMATED ATTACKER OBJECTIVES</span>
            <span className="text-[10px] font-mono text-slate-400">Bayesian Objective Inference</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-orange-950/20 border border-orange-800/40 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-orange-300">1. CREDENTIALS OBJECTIVE</span>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">PRIMARY TARGET</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adversary focus: Highest priority objective. Repeated brute-force credential spraying detected on Auth Service.
              </p>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-amber-300">2. DATABASE OBJECTIVE</span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px]">SECONDARY TARGET</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adversary focus: Secondary objective. Predicted exfiltration path diverted into isolated Decoy Database.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-slate-400">3. ADMINISTRATIVE ACCESS</span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">LOW ACTIVITY</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adversary focus: Minimal observed activity. Under continuous passive monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5 & 6: SYSTEM DEFENCE DECISION & EXECUTION EXPLANATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs font-mono uppercase">SYSTEM DEFENCE DECISION & RESULT</span>
            <RoleGuard permission="execute_defence_action" fallback={<span className="text-[10px] font-mono text-slate-500">Read-Only</span>}>
              <span className="badge-green font-mono">POLICY APPROVED</span>
            </RoleGuard>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-300">AUTH SERVICE → PROTECT</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Rationale: High credential risk triggered strict rate limiting and multi-factor authentication enforcement.
              </p>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-300">API GATEWAY → MONITOR</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Rationale: Elevated connection burst logged for deep packet inspection and attack path tracing.
              </p>
            </div>

            <div className="p-3 bg-orange-950/30 border border-orange-500/50 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-orange-300">POSTGRES DB → DECEIVE</span>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">HONEYPOT ACTIVE</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Rationale: Exfiltration traffic redirected to isolated VLAN 99 Decoy DB; real database 100% protected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: WHAT HAPPENED NEXT? (Live Narrative Story Panel) */}
      <LiveDefenceStory />

      {/* Right-side Detail Inspector Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);
